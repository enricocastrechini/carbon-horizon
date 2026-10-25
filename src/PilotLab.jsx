import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Download, Fingerprint, LoaderCircle } from 'lucide-react';
import { journey, layers } from './pilotJourney.js';

const format = value => new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(value);
async function hashBytes(bytes) {
  if (!globalThis.crypto?.subtle) throw new Error('Fingerprint checks require Web Crypto over HTTPS or localhost.');
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}
function saveJson(value, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function PilotLab() {
  const [data, setData] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [receiptStatus, setReceiptStatus] = useState('loading');
  const [serialized, setSerialized] = useState('');
  const [reportHash, setReportHash] = useState('');
  const [loadError, setLoadError] = useState('');
  const [imageError, setImageError] = useState('');
  const [step, setStep] = useState(0);
  const [layer, setLayer] = useState('rgb');
  const [split, setSplit] = useState(50);
  const [compared, setCompared] = useState(false);
  const [checking, setChecking] = useState(false);
  const [fileChecks, setFileChecks] = useState({});
  const [verified, setVerified] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState(false);
  const [tamper, setTamper] = useState(null);
  const [testingTamper, setTestingTamper] = useState(false);
  const heading = useRef(null);
  const navigated = useRef(false);
  const base = `${import.meta.env.BASE_URL}pilot/`;

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      let digest;
      try {
        const response = await fetch(`${base}result.json`, { signal: controller.signal });
        if (!response.ok) throw new Error('The pilot report could not be loaded. Reload this page to retry.');
        const bytes = await response.arrayBuffer();
        const text = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(text);
        if (parsed.schema !== 'carbon-horizon-pilot/v1' || !parsed.files || !parsed.sources) throw new Error('The pilot report has an unsupported format.');
        setData(parsed); setSerialized(text);
        digest = await hashBytes(bytes); setReportHash(digest);
      } catch (error) {
        if (error.name !== 'AbortError') setLoadError(error.message || 'Unable to load the pilot.');
        return;
      }
      try {
        const response = await fetch(`${base}local-chain.json`, { signal: controller.signal });
        if (!response.ok) throw new Error('Receipt unavailable');
        const chain = await response.json();
        if (chain.reportSha256 !== digest) { setReceiptStatus('mismatch'); return; }
        setReceipt(chain); setReceiptStatus('matched');
      } catch (error) { if (error.name !== 'AbortError') setReceiptStatus('unavailable'); }
    }
    load();
    return () => controller.abort();
  }, [base]);

  useEffect(() => {
    if (navigated.current) heading.current?.focus();
  }, [step]);

  function goTo(next) {
    if (checking || testingTamper) return;
    navigated.current = true;
    setStep(next); setLayer(journey[next].layer); setSplit(50); setImageError('');
  }

  async function verifyFiles() {
    setChecking(true); setVerified(false); setFileChecks({}); setTamper(null);
    setVerificationError(false); setVerificationMessage('Reading the actual output files and calculating their fingerprints…');
    try {
      const entries = Object.entries(data.files);
      for (let start = 0; start < entries.length; start += 3) {
        const batch = await Promise.allSettled(entries.slice(start, start + 3).map(async ([name, expected]) => {
          try {
            const response = await fetch(`${base}${name}`);
            if (!response.ok) throw new Error(`Missing output: ${name}`);
            const actual = await hashBytes(await response.arrayBuffer());
            const matches = actual === expected;
            setFileChecks(current => ({ ...current, [name]: { status: matches ? 'matched' : 'failed', expected, actual } }));
            if (!matches) throw new Error(`Integrity mismatch: ${name}`);
          } catch (error) {
            setFileChecks(current => ({ ...current, [name]: { ...current[name], status: 'failed', error: error.message } }));
            throw error;
          }
        }));
        const failure = batch.find(result => result.status === 'rejected');
        if (failure) throw failure.reason;
      }
      setVerified(true);
      setVerificationMessage(`All ${entries.length} files match. The published outputs are consistent with the report you are inspecting.`);
    } catch (error) { setVerificationError(true); setVerificationMessage(error.message || 'Verification failed. Please retry.'); }
    finally { setChecking(false); }
  }

  async function testEditedReport() {
    setTestingTamper(true); setTamper(null);
    try {
      // Replace only the first occurrence: preserve every other original byte.
      const changed = serialized.replace(/("meanNdviAfter"\s*:\s*)(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/,
        (_, prefix, value) => `${prefix}${Number(value) + 0.01}`);
      if (changed === serialized) throw new Error('The result field could not be located.');
      const changedHash = await hashBytes(new TextEncoder().encode(changed));
      setTamper({ original: data.meanNdviAfter, edited: data.meanNdviAfter + 0.01, changedHash, rejected: changedHash !== reportHash });
    } catch (error) { setTamper({ error: error.message || 'The check could not run. Please retry.' }); }
    finally { setTestingTamper(false); }
  }

  function downloadEvidence() {
    if (!verified) return;
    saveJson({ report: data, reportSerialized: serialized, reportSha256: reportHash, localChainExecution: receipt,
      browserVerification: { files: fileChecks, editedCopyTest: tamper },
      verification: 'Output files were checked in this browser against the bundled report. Source authenticity and scientific accuracy are separate questions.',
      scientificStatus: 'Spectral baseline; no validated AI, biomass estimate or certified carbon credit.' }, 'rhodes-pilot-evidence.json');
  }

  const current = journey[step];
  const activeLayer = layers.find(item => item.id === layer);
  const matchedCount = Object.values(fileChecks).filter(item => item.status === 'matched').length;
  const totalFiles = data ? Object.keys(data.files).length : 0;
  const lockedNext = step === 4 && !verified;
  const source = data?.sources.find(item => item.sensor === 'Sentinel-2 L2A');

  return <section className="section demo-section guided-demo" id="demo">
    <div className="section-label"><span className="mono">THE FEASIBILITY LAB / A GUIDED WALKTHROUGH</span><span className="section-rule" /></div>
    <div className="section-heading-row"><h2>See the process.<br /><em>Check the evidence.</em></h2><p className="section-intro">Follow six steps through a real satellite case. At each step, see what was done, inspect the evidence and understand what the result actually establishes.</p></div>
    <div className="demo-ground-rules"><div><span className="mono">THE QUESTION</span><p>Can we observe a documented vegetation disturbance and trace its evidence through a digital workflow?</p></div><div><span className="mono">HOW THIS DEMO RUNS</span><p>Satellite processing and local blockchain transactions were executed beforehand. File verification and the edited-report test run now, in your browser.</p></div></div>
    {!data ? <div className="scene-loading" role="status">{loadError || 'Loading the pilot and its source metadata…'}</div> : <>
      {loadError && <p className="proof-error" role="alert">{loadError}</p>}
      <nav className="journey-nav" aria-label="Guided demo steps">{journey.map((item, index) => <button type="button" key={item.label} aria-current={step === index ? 'step' : undefined} disabled={checking || testingTamper || (index === 5 && !verified)} onClick={() => goTo(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.label}</button>)}</nav>
      <div className="journey-chapter"><span className="mono">STEP {step + 1} OF {journey.length} / {current.phase}</span><h3 id="journey-heading" ref={heading} tabIndex={-1}>{current.title}</h3><p>{current.question}</p></div>
      <div className="lab-shell"><div className="lab-toolbar"><span>RHODES, GREECE / JULY 2023</span><span className="mono">{step === 4 ? 'INTERACTIVE BROWSER CHECK' : step === 5 ? 'RECORDED LOCAL EXECUTION' : 'PRECOMPUTED SATELLITE OUTPUT'}</span></div>
        <div className="lab-layout"><div className="imagery-column">
          <div className="scene-comparison">
            <img src={`${base}${layer === 'change' ? 'change.png' : `after-${layer}.png`}`} alt={`${activeLayer.caption}, ${layer === 'change' ? 'calculated candidate changes' : 'after the event'}`} onError={() => setImageError('This image could not be loaded. Reload to retry.')} />
            {layer !== 'change' && <><img className="scene-before" src={`${base}before-${layer}.png`} style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }} alt={`${activeLayer.caption}, before the event`} onError={() => setImageError('This image could not be loaded. Reload to retry.')} /><div className="scene-divider" style={{ left: `${split}%` }} aria-hidden="true"><span>↔</span></div><div className="scene-label before">{layer === 'radar' ? '17 JUL 2023' : '08 JUL 2023'} / BEFORE</div><div className="scene-label after">{layer === 'radar' ? '29 JUL 2023' : '02 AUG 2023'} / AFTER</div></>}
            <span className="scene-caption">{layer === 'change' ? 'SPECTRAL RULE / CALCULATED OUTPUT' : 'IDENTICAL AREA AND PIXEL GRID'}</span>
          </div>
          {layer !== 'change' && <label className="comparison-control">Move to compare the two dates <span>{split}% before / {100 - split}% after</span><input type="range" min="0" max="100" value={split} onChange={event => { setSplit(Number(event.target.value)); setCompared(true); }} aria-label="Compare before and after satellite images" /></label>}
          <p className="layer-caption">{activeLayer.caption}</p><p className="layer-explanation">{activeLayer.legend}</p>
          {imageError && <p className="proof-error" role="alert">{imageError}</p>}
          {(step === 2 || step === 3) && <div className="guided-layer-choices" aria-label="Views for this step">{(step === 2 ? ['radar', 'rgb'] : ['change', 'ndvi', 'false-colour']).map(id => { const item = layers.find(entry => entry.id === id); return <button key={id} type="button" aria-pressed={layer === id} onClick={() => { setLayer(id); setImageError(''); }}>{item.label}</button>; })}</div>}
          {(step === 4 || step === 5) && <p className="guided-image-note">This is the same candidate-change map from step 4. The following checks concern its evidence and digital record, not a new satellite calculation.</p>}
        </div><div className="lab-console">
          <div className="guide-instruction"><span className="mono">{step === 4 ? 'TRY IT YOURSELF' : 'WHAT TO DO'}</span><p>{current.action}</p></div>
          {step === 0 && <div className="step-evidence"><h4>Inspect the source, not just the picture</h4><p>The wildfire is documented by Copernicus EMS. The analysis window covers {format(data.analysisAreaHa)} hectares on a shared 20 m grid; it is an exploratory rectangle, not the official fire perimeter.</p><a href={data.config.eventSource} target="_blank" rel="noreferrer">Open the documented event <ArrowUpRight size={14} /></a>{source && <a href={source.url} target="_blank" rel="noreferrer">Inspect the original satellite catalogue entry <ArrowUpRight size={14} /></a>}<a href={`${base}aoi.geojson`} download>Download the exact study boundary <Download size={14} /></a><span className="execution-label">SOURCE METADATA / AVAILABLE FOR YOUR INSPECTION</span></div>}
          {step === 1 && <div className="step-evidence"><h4>Read the scene in three parts</h4><ol><li>Find the same roads and terrain on both dates.</li><li>Look for vegetation changing from green to darker brown.</li><li>Keep the dark quality-mask gaps separate from actual land changes.</li></ol><p className="interaction-note">{compared ? 'Slider used: you are changing the visible comparison, not rerunning an analysis.' : 'The slider reveals already processed observations. It does not generate new imagery.'}</p></div>}
          {step === 2 && <div className="step-evidence"><h4>Check coverage before trusting a result</h4><div className="guided-number"><b>{format(data.pairedValidFraction * 100)}%</b><span>of this area has valid optical pixels on both dates</span></div><p>Clouds, shadow, snow and invalid pixels are excluded. The remaining gaps stay masked rather than being filled with invented values.</p><p>The radar acquisitions are from 17 and 29 July, both on descending relative orbit 36. Radar adds complementary observations; its colours are not directly comparable to an optical photograph.</p><a href={`${base}before-quality.tif`} download>Inspect the georeferenced quality mask <Download size={14} /></a></div>}
          {step === 3 && <div className="step-evidence"><h4>From bands to a stated rule</h4><ol><li>Calculate vegetation and burn-sensitive indices from reflectance.</li><li>Select pre-event vegetation using land classification and NDVI &gt; {data.config.vegetationNdvi}.</li><li>Flag pixels where the before-minus-after NBR difference exceeds {data.config.changeDnbr}.</li></ol><div className="ndvi-comparison"><span>Mean vegetation index on the same selected pixels</span><b>{data.meanNdviBefore.toFixed(3)} <span>→</span> {data.meanNdviAfter.toFixed(3)}</b></div><p>The rule flags <strong>{format(data.flaggedAreaHa)} ha</strong> inside this window. This is a candidate-change area, not a validated burned-area or CO₂ estimate.</p>{data.comparisonWindow && <p>A visually selected northwest comparison window changes much less: {data.comparisonWindow.meanNdviBefore.toFixed(3)} → {data.comparisonWindow.meanNdviAfter.toFixed(3)}. This is an internal comparison, not independent model validation.</p>}<details className="calculation-details"><summary>Inspect the exact calculation</summary><p>NDVI = (near-infrared − red) / (near-infrared + red). NBR = (near-infrared − shortwave infrared) / (near-infrared + shortwave infrared).</p><p>Subtract after-event NBR from before-event NBR, then apply the threshold only to vegetation pixels with valid observations on both dates. The downloadable raster preserves these numerical results and their spatial grid.</p></details><a href={`${base}dnbr.tif`} download>Inspect the quantitative change raster <Download size={14} /></a><span className="execution-label">PRECOMPUTED SPECTRAL BASELINE / NO TRAINED AI</span></div>}
          {step === 4 && <div className="step-evidence verification-step"><h4>1. Check the original files</h4><p>A fingerprint is a number calculated from a file’s exact bytes. This browser will read each output and compare its fingerprint with the saved report.</p><button className="button button-primary" type="button" disabled={checking || testingTamper || !reportHash} onClick={verifyFiles}>{checking ? <LoaderCircle className="spin" size={15} /> : <Fingerprint size={15} />}{checking ? 'Checking real files…' : verified ? 'Check all files again' : `Check the ${totalFiles} evidence files`}</button><div className="verification-progress"><progress max={totalFiles} value={matchedCount} aria-label="Evidence files with matching fingerprints" /><span>{matchedCount} / {totalFiles} fingerprints match</span></div><p className={`verification-status${verificationError ? ' is-error' : ''}`} role="status">{verificationMessage || 'No file check has been run in this session.'}</p><details className="file-check-details"><summary>Inspect individual file checks</summary><ul>{Object.entries(data.files).map(([name]) => <li key={name}><span>{name}</span><span data-status={fileChecks[name]?.status || 'unchecked'}>{fileChecks[name]?.status === 'matched' ? 'Match' : fileChecks[name]?.status === 'failed' ? 'Failed' : 'Not checked'}</span></li>)}</ul></details><h4>2. Deliberately edit one result</h4><p>Change the mean after-event vegetation index by +0.010 in a copy of the report. The original report and files stay intact. Expected outcome: the copy no longer matches the original fingerprint.</p><button className="tamper-button" type="button" disabled={!verified || testingTamper || checking} onClick={testEditedReport}>{testingTamper ? 'Calculating the edited fingerprint…' : 'Edit a report copy and test it'}</button>{tamper && <div className={`tamper-result${tamper.rejected ? '' : ' is-error'}`} role="status">{tamper.error ? tamper.error : <><strong>{tamper.rejected ? 'Edited copy rejected: its fingerprint is different.' : 'Unexpected matching fingerprint. The test did not demonstrate rejection.'}</strong><p>Mean NDVI after: {tamper.original.toFixed(3)} → {tamper.edited.toFixed(3)}. Only this field was edited in a copy.</p><details><summary>Compare the exact fingerprints</summary><p>Original report</p><code>{reportHash}</code><p>Edited copy</p><code>{tamper.changedHash}</code></details></>}</div>}<span className="execution-label">RUNS NOW IN YOUR BROWSER / NO BLOCKCHAIN TRANSACTION</span></div>}
          {step === 5 && <div className="step-evidence"><h4>Inspect what already ran</h4>{receipt ? <><p className="recorded-notice">Recorded execution on an ephemeral local EVM, chain {receipt.chainId}. Opening this page does not execute a contract or contact a public blockchain.</p><div className="recorded-lifecycle">{receipt.transactions.map((transaction, index) => <details key={transaction.action}><summary><span>{index + 1}</span>{['Register the report fingerprint', 'Record a test reviewer’s approval', 'Create one arbitrary test unit', 'Retire that unit permanently'][index]}</summary><p>Executed in local block {transaction.blockNumber}. Status: {transaction.status === 1 ? 'successful' : 'failed'}.</p><code>{transaction.hash}</code><a href={`${base}local-chain.json`} download>Inspect the saved execution receipt <Download size={12} /></a></details>)}</div><div className="unit-balance"><span>Test units issued <b>{receipt.testUnitsIssued}</b></span><span>Retired <b>{receipt.retired}</b></span><span>Available to reuse <b>{receipt.outstanding}</b></span></div><p>The saved receipt contains the same report fingerprint calculated here. {receipt.checks.filter(check => check.passed).length} contract checks passed in the recorded run.</p><details className="contract-check-details"><summary>Which attempts were rejected?</summary><ul>{receipt.checks.map(check => <li key={check.name}>{check.name}: {check.passed ? 'passed in recorded run' : 'failed'}</li>)}</ul></details><p>The unit is a test object, not a tonne of verified carbon. The temporary chain’s state is no longer running; its execution can be reproduced with the project scripts.</p></> : <p className="receipt-warning" role="status">{receiptStatus === 'loading' ? 'Checking whether the saved receipt matches this report…' : receiptStatus === 'mismatch' ? 'The saved receipt belongs to a different report. No matching contract execution can be shown for this version.' : 'No matching local execution receipt is available. File integrity can still be checked in step 5.'}</p>}</div>}
          <div className="guide-outcome"><span className="mono">WHAT YOU SHOULD SEE</span><p>{current.expect}</p><span className="mono">WHAT THIS ESTABLISHES</span><p>{current.meaning}</p></div>
        </div></div>
      </div>
      <div className="journey-controls"><button type="button" className="journey-back" disabled={step === 0 || checking || testingTamper} onClick={() => goTo(step - 1)}><ArrowLeft size={15} /> Previous step</button><span className="journey-navigation-note">{lockedNext ? 'Run the file check above before following the evidence into the recorded contract.' : step === 5 ? 'You have reached the end of the walkthrough.' : `Next: ${journey[step + 1].title.toLowerCase()}`}</span>{step < journey.length - 1 ? <button className="button button-primary" type="button" disabled={lockedNext || checking || testingTamper} onClick={() => goTo(step + 1)}>Step {step + 2}: {journey[step + 1].label} <ArrowRight size={15} /></button> : <button className="button button-primary" type="button" disabled={!verified} onClick={downloadEvidence}><Download size={15} /> Download your evidence bundle</button>}</div>
      {step === 5 && <div className="journey-summary"><h3>What has been demonstrated?</h3><ul><li>Real, attributable satellite inputs and aligned observations.</li><li>A calculated spectral baseline with explicit parameters.</li><li>{verified ? 'File fingerprints checked in this browser.' : 'File verification is not complete in this session.'}</li><li>{tamper?.rejected ? 'An edited report copy was detected in this browser.' : 'The edited-copy test has not been completed in this session.'}</li><li>{receipt ? 'A matching, recorded local contract lifecycle.' : 'A matching local contract receipt is unavailable.'}</li></ul><p><strong>Next scientific milestone:</strong> independent reference labels, evaluated AI and biomass estimates. Certification and public-chain deployment remain separate future steps.</p></div>}
      <details className="pilot-provenance"><summary>Technical evidence, source files and reproducibility</summary><div className="pilot-source-list">{data.sources.map(item => <article key={item.id}><span className="mono">{item.sensor} / {item.date.slice(0, 10)}</span><a href={item.url} target="_blank" rel="noreferrer">{item.id} <ArrowUpRight size={12} /></a></article>)}</div><p>{data.attribution}</p><p>To reproduce the work from the repository: run the documented Python pipeline, then <code>npm run demo:receipt</code> to regenerate the local execution or <code>npm run test:contract</code> to verify it. These commands do not run when you click through this walkthrough.</p><ul>{data.limitations.map(item => <li key={item}>{item}</li>)}</ul><p>Matching a fingerprint demonstrates consistency with the bundled report. Replacing an entire report and all its files is outside the protection offered by this standalone page.</p><a className="text-link" href={`${base}result.json`} download>Download the full report <Download size={13} /></a>{receipt && <a className="text-link" href={`${base}local-chain.json`} download>Download recorded contract execution <Download size={13} /></a>}<details><summary>Report fingerprint</summary><code className="report-fingerprint">{reportHash || 'Unavailable'}</code></details></details>
    </>}
  </section>;
}
