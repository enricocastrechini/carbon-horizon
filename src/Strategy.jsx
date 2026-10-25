import React, { useState } from 'react';
import { ArrowUpRight, Building2, Landmark, Sprout, ShieldCheck } from 'lucide-react';

const markets = [
  {
    id: 'compliance', label: 'Compliance markets', heading: 'Emissions reporting with legal obligations.',
    body: 'The EU Emissions Trading System requires regulated operators to monitor emissions, obtain independent verification and surrender allowances. Its extension to maritime transport illustrates demand for auditable emissions information.',
    implication: 'Design reporting around approved monitoring plans and accredited verification. Land-based biomass estimates alone cannot establish maritime emissions compliance.',
    reference: 'Directive (EU) 2023/959', url: 'https://eur-lex.europa.eu/eli/dir/2023/959/oj',
  },
  {
    id: 'voluntary', label: 'Voluntary markets', heading: 'Credibility depends on the methodology.',
    body: 'Project developers seek evidence for climate outcomes under crediting programmes with different methodologies and registries. Buyers need to understand baselines, additionality, permanence and the risk of double counting.',
    implication: 'Support project monitoring and evidence review. A lower emissions estimate does not automatically create a carbon credit; issuance depends on the applicable programme and verification.',
    reference: 'Report §2.3 · Presentation slide 7',
  },
  {
    id: 'crcf', label: 'EU removal certification', heading: 'A framework for higher-quality removals.',
    body: 'The EU Carbon Removals and Carbon Farming Certification Framework establishes a voluntary certification framework covering permanent removals, carbon farming and carbon storage in products.',
    implication: 'Map each use case to the applicable methodology and certification requirements. A digital evidence trail supports review; it does not itself confer certification or create an EU ETS allowance.',
    reference: 'Regulation (EU) 2024/3012', url: 'https://eur-lex.europa.eu/eli/reg/2024/3012/oj',
  },
];

const stakeholders = [
  { icon: Landmark, name: 'Public institutions', need: 'Consistent national evidence and accountable procurement.', model: 'Multi-year contracts', role: 'Proposed anchor customers' },
  { icon: Building2, name: 'Corporates & finance', need: 'Portfolio insights, reporting workflows and data integration.', model: 'Data services · APIs · SaaS', role: 'Potential expansion segments' },
  { icon: Sprout, name: 'Project developers', need: 'Usable monitoring evidence and lower verification burdens.', model: 'Usage-based services', role: 'Operational users' },
  { icon: ShieldCheck, name: 'Verifiers & researchers', need: 'Inspectable methods, reference data and uncertainty estimates.', model: 'Independent review', role: 'Validation partners' },
];

export function Regulation() {
  const [selected, setSelected] = useState('compliance');
  const market = markets.find(item => item.id === selected);

  function handleKeyDown(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % markets.length;
    else if (event.key === 'ArrowLeft') next = (index + markets.length - 1) % markets.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = markets.length - 1;
    else return;
    event.preventDefault();
    setSelected(markets[next].id);
    document.getElementById(`market-tab-${markets[next].id}`).focus();
  }

  return (
    <section className="section regulation-section" id="regulation">
      <div className="section-label"><span className="mono">03 / REGULATORY CONTEXT</span><span className="section-rule" /></div>
      <div className="section-heading-row">
        <h2>Trust starts with<br /><em>the rules.</em></h2>
        <p className="section-intro">Different markets require different evidence. The capstone treats regulation as a design constraint for digital monitoring, reporting and verification (MRV).</p>
      </div>
      <div className="market-tabs" role="tablist" aria-label="Carbon market frameworks">
        {markets.map((item, index) => (
          <button key={item.id} id={`market-tab-${item.id}`} type="button" role="tab" aria-selected={selected === item.id} aria-controls={`market-panel-${item.id}`} tabIndex={selected === item.id ? 0 : -1} onClick={() => setSelected(item.id)} onKeyDown={event => handleKeyDown(event, index)}>{item.label}</button>
        ))}
      </div>
      <div className="market-panel" id={`market-panel-${market.id}`} role="tabpanel" aria-labelledby={`market-tab-${market.id}`} tabIndex={0}>
        <div><span className="mono">THE FRAMEWORK</span><h3>{market.heading}</h3><p>{market.body}</p></div>
        <div className="market-implication"><span className="mono">WHAT THIS MEANS FOR THE CONCEPT</span><p>{market.implication}</p>
          {market.url ? <a className="text-link" href={market.url} target="_blank" rel="noreferrer">{market.reference} <ArrowUpRight size={15} /></a> : <small>{market.reference}</small>}
        </div>
      </div>
      <p className="source-note">Context from the project materials, with links to the underlying EU legislation. Applicability and implementing requirements must be checked for each pilot.</p>
    </section>
  );
}

export function BusinessModel() {
  return (
    <section className="section business-section" id="business">
      <div className="section-label"><span className="mono">04 / ADOPTION & VALUE</span><span className="section-rule" /></div>
      <div className="section-heading-row"><h2>Build credibility.<br /><em>Then scale value.</em></h2><p className="section-intro">The report proposes public-sector funding first, followed by scalable data services. These are business-model hypotheses, subject to procurement and customer validation.</p></div>
      <div className="stakeholder-grid">
        {stakeholders.map(({ icon: Icon, name, need, model, role }) => <article className="stakeholder-card" key={name}><Icon size={23} aria-hidden="true" /><span className="mono">{role}</span><h3>{name}</h3><p>{need}</p><div className="stakeholder-model">{model}</div></article>)}
      </div>
      <div className="deployment-grid">
        <article><span className="mono">PHASE 01 / ESTABLISH</span><h3>Secure an anchor customer</h3><p>Explore multi-year public contracts to fund a scoped data pipeline, governance and a first independently evaluated pilot.</p></article>
        <article><span className="mono">PHASE 02 / EXPAND</span><h3>Introduce data services</h3><p>After validation and institutional acceptance, test Data-as-a-Service, APIs and dashboards with industry and finance.</p></article>
        <article><span className="mono">PHASE 03 / DIVERSIFY</span><h3>Develop an intelligence platform</h3><p>Evaluate broader analytics and cross-border interoperability once evidence quality, demand and unit economics justify expansion.</p></article>
      </div>
      <p className="source-note">Source: final report §§4.1–4.3; presentation slides 16–20. Pricing, willingness to pay and commercial viability remain unvalidated.</p>
    </section>
  );
}

export function ValidationRisks() {
  return (
    <div className="validation-risks">
      <div><span className="mono">VALIDATION GATES</span><h3>What must be demonstrated?</h3></div>
      <details><summary>Data accuracy & uncertainty</summary><p>Benchmark biomass estimates and change detection against independent field data. Report errors by landscape, sensor coverage and season; document gaps and model limitations.</p></details>
      <details><summary>Governance & regulatory acceptance</summary><p>Assign ownership across data providers, platform operators and reviewers. Agree on data rights, evidence formats and applicable methodologies with competent institutions and independent verifiers.</p></details>
      <details><summary>Adoption & commercial sustainability</summary><p>Test workflows with prospective users, evaluate procurement timelines and compare total delivery costs with willingness to pay. Seek independent review before making performance claims.</p></details>
    </div>
  );
}
