import React from 'react';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Satellite, ScanSearch,
  Fingerprint, ChartNoAxesCombined, Leaf, ShieldCheck, Globe2,
  Layers3, Compass, ExternalLink, Menu
} from 'lucide-react';

const sdgs = [
  {
    number: 'SDG 13',
    title: 'Climate Action',
    body: 'Explore stronger evidence for monitoring land-related carbon outcomes and informing climate decisions.',
    icon: Leaf,
  },
  {
    number: 'SDG 9',
    title: 'Industry, Innovation & Infrastructure',
    body: 'Connect Earth observation, AI-enabled analysis and operational reporting through a digital infrastructure concept.',
    icon: Layers3,
  },
  {
    number: 'SDG 16',
    title: 'Peace, Justice & Strong Institutions',
    body: 'Investigate how traceability and auditable information could support transparency, accountability and trust.',
    icon: ShieldCheck,
  },
];

const capabilities = [
  {
    n: '01',
    title: 'Observe',
    subtitle: 'Earth observation',
    body: 'Optical and radar satellite data can provide complementary views of the environment and its changes over time.',
    icon: Satellite,
    tags: ['Sentinel-2 · Optical', 'Sentinel-1 · Radar'],
  },
  {
    n: '02',
    title: 'Analyse',
    subtitle: 'AI + high-performance computing',
    body: 'Machine learning and scalable computing could support environmental analysis, including biomass-related estimation and land-use change detection.',
    icon: ScanSearch,
    tags: ['Machine learning', 'Geospatial analytics'],
  },
  {
    n: '03',
    title: 'Trace',
    subtitle: 'Evidence & integrity',
    body: 'Digital records and audit-oriented workflows could help make evidence easier to inspect, compare and trace.',
    icon: Fingerprint,
    tags: ['Digital traceability', 'Auditability'],
  },
  {
    n: '04',
    title: 'Inform',
    subtitle: 'Decision support',
    body: 'Clearer, more accessible information could support reporting workflows and better-informed stakeholder decisions.',
    icon: ChartNoAxesCombined,
    tags: ['Reporting workflows', 'Stakeholder review'],
  },
];

const roadmap = [
  ['Define the use case', 'Choose a specific landscape, user group and decision the information must support.'],
  ['Validate the evidence', 'Compare outputs with trusted reference data; document uncertainty, limitations and failure modes.'],
  ['Design governance', 'Clarify data rights, accountability, audit procedures and regulatory fit.'],
  ['Test adoption & economics', 'Assess workflow fit, operating costs and a sustainable delivery model with prospective users.'],
];

function Architecture() {
  return (
    <div className="architecture">
      <div className="architecture-topline">
        <span className="mono">CONCEPTUAL SYSTEM FLOW</span>
        <span className="live-dot"><i /> NOT A DEPLOYED SYSTEM</span>
      </div>
      <div className="flow">
        {capabilities.map((item, i) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.n}>
              <div className="flow-node">
                <div className="flow-icon"><Icon size={21} strokeWidth={1.6} /></div>
                <div className="flow-num mono">{item.n} / {item.title.toUpperCase()}</div>
                <h3>{item.subtitle}</h3>
                <p>{item.body}</p>
                <div className="tag-list">{item.tags.map(t => <span key={t}>{t}</span>)}</div>
              </div>
              {i < capabilities.length - 1 && <div className="flow-arrow"><ArrowRight size={17} /></div>}
            </React.Fragment>
          );
        })}
      </div>
      <div className="architecture-foot">
        <span>Inputs → analysis → traceable evidence → decisions</span>
        <span>Requires technical, regulatory and user validation</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Carbon Horizon home">
          <span className="brand-symbol"><Globe2 size={19} /></span>
          <span>CARBON<span className="brand-light">HORIZON</span></span>
        </a>
        <nav className="desktop-nav">
          <a href="#challenge">The challenge</a>
          <a href="#approach">The approach</a>
          <a href="#impact">SDG alignment</a>
          <a href="#roadmap">Next steps</a>
        </nav>
        <a className="header-cta" href="#about">Project overview <ArrowUpRight size={15} /></a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-line" /> CLIMATE INNOVATION / CAPSTONE PROJECT</div>
            <h1>Climate data<br />you can <em>trust.</em></h1>
            <p className="hero-lead">
              Exploring how satellite Earth observation, artificial intelligence and digital traceability
              could support more transparent carbon monitoring, reporting and verification.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#approach">Explore the concept <ArrowDownRight size={17} /></a>
              <a className="text-link" href="#about">About the project <ArrowRight size={15} /></a>
            </div>
            <div className="hero-foot">
              <span><i className="status-dot" /> STRATEGIC FEASIBILITY CONCEPT</span>
              <span className="mono">SDG 13 · SDG 9 · SDG 16</span>
            </div>
          </div>
          <div className="hero-art" aria-label="Abstract satellite observation graphic">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <div className="planet">
              <div className="planet-land land-one" />
              <div className="planet-land land-two" />
              <div className="planet-land land-three" />
              <div className="planet-glow" />
            </div>
            <div className="satellite-mark"><Satellite size={25} strokeWidth={1.25} /></div>
            <div className="art-label label-top"><span className="mono">EO / 01</span><b>EARTH OBSERVATION</b></div>
            <div className="art-label label-bottom"><span className="mono">AI + MRV</span><b>FROM SIGNAL TO EVIDENCE</b></div>
            <div className="coordinate mono">45° 27' N<br />9° 11' E</div>
          </div>
          <div className="hero-index mono">01 — 05</div>
        </section>

        <section className="ticker" aria-label="Project themes">
          <div><span>EARTH OBSERVATION</span><i>✳</i><span>ARTIFICIAL INTELLIGENCE</span><i>✳</i><span>CLIMATE INTEGRITY</span><i>✳</i><span>TRUSTED DATA</span><i>✳</i><span>EARTH OBSERVATION</span></div>
        </section>

        <section className="section challenge-section" id="challenge">
          <div className="section-label"><span className="mono">01 / THE CHALLENGE</span><span className="section-rule" /></div>
          <div className="two-col">
            <h2>Climate action needs<br /><em>evidence</em> people trust.</h2>
            <div className="section-copy">
              <p className="copy-large">Carbon-related decisions depend on environmental information that is consistent, traceable and useful to the people making them.</p>
              <p>Monitoring and verification can involve fragmented datasets, complex methods and significant operational effort. Carbon Horizon asks whether a digital environmental-intelligence approach could help connect Earth observation data, AI-enabled analysis and auditable records.</p>
              <p className="muted">Technology is only part of the answer. Governance, regulation, incentives and local needs are just as important for adoption.</p>
            </div>
          </div>
          <div className="stat-strip">
            <div><span className="stat-index mono">A / INPUT</span><b>Satellite data</b><small>Optical + radar observations</small></div>
            <div><span className="stat-index mono">B / PROCESS</span><b>AI-enabled analysis</b><small>Potential environmental insights</small></div>
            <div><span className="stat-index mono">C / OUTCOME</span><b>Traceable evidence</b><small>Designed for review and validation</small></div>
          </div>
        </section>

        <section className="section approach-section" id="approach">
          <div className="section-label"><span className="mono">02 / THE CONCEPT</span><span className="section-rule" /></div>
          <div className="section-heading-row">
            <div><h2>From observation<br />to <em>accountability.</em></h2></div>
            <p className="section-intro">A conceptual workflow for connecting environmental signals with decision-ready, traceable information.</p>
          </div>
          <Architecture />
          <div className="approach-note">
            <span className="note-icon"><Compass size={19} /></span>
            <p><strong>The design question:</strong> How might we combine existing technologies into a workflow that is technically credible, useful to stakeholders and transparent about uncertainty?</p>
          </div>
        </section>

        <section className="section impact-section" id="impact">
          <div className="section-label"><span className="mono">03 / INTENDED CONTRIBUTION</span><span className="section-rule" /></div>
          <div className="section-heading-row">
            <h2>Designed around<br /><em>the SDGs.</em></h2>
            <p className="section-intro">The project explores potential contribution pathways. These are not claims of verified or measured environmental impact.</p>
          </div>
          <div className="sdg-grid">
            {sdgs.map((sdg, i) => {
              const Icon = sdg.icon;
              return (
                <article className="sdg-card" key={sdg.number}>
                  <div className="sdg-card-top"><span className="mono">{sdg.number}</span><Icon size={21} strokeWidth={1.5} /></div>
                  <div className="sdg-decoration">0{i + 1}</div>
                  <h3>{sdg.title}</h3>
                  <p>{sdg.body}</p>
                  <a href="https://sdgs.un.org/goals" target="_blank" rel="noreferrer">Explore the SDGs <ExternalLink size={13} /></a>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section roadmap-section" id="roadmap">
          <div className="section-label"><span className="mono">04 / FROM CONCEPT TO PILOT</span><span className="section-rule" /></div>
          <div className="two-col roadmap-top">
            <h2>Credibility is<br />built through <em>validation.</em></h2>
            <div className="section-copy">
              <p className="copy-large">A promising concept needs to earn trust through testing, governance and real user feedback—not jump straight from a presentation to claims of impact.</p>
            </div>
          </div>
          <div className="roadmap-list">
            {roadmap.map(([title, body], i) => (
              <div className="roadmap-item" key={title}>
                <span className="roadmap-number mono">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <ArrowUpRight className="roadmap-arrow" size={19} />
              </div>
            ))}
          </div>
          <div className="pilot-banner">
            <div><span className="mono">THE NEXT MEANINGFUL MILESTONE</span><h3>A tightly scoped, independently evaluated pilot.</h3></div>
            <p>Defined users. Reference data. Transparent uncertainty. Clear criteria for accuracy, cost, usability and auditability.</p>
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="section-label"><span className="mono">05 / THE PERSPECTIVE</span><span className="section-rule" /></div>
          <div className="about-layout">
            <div>
              <h2>Bridging technology<br />and <em>implementation.</em></h2>
              <div className="about-mark"><Globe2 size={26} strokeWidth={1.2} /><span className="mono">ENGINEERING × AI × STRATEGY</span></div>
            </div>
            <div className="about-copy">
              <p className="copy-large">Carbon Horizon was developed as a multidisciplinary capstone during an Executive Master in Advanced Management at LUISS Business School.</p>
              <p>My background combines computer engineering and artificial intelligence, applied AI research, and management education. I am interested in the space between technical possibility and real-world adoption: understanding the problem, assessing trade-offs, aligning stakeholders and turning a technology concept into a testable plan.</p>
              <p className="muted">My role in the team focused on the technology dimension—connecting the proposed solution to its underlying technical building blocks and assessing how they could fit together. The concept remains a strategic study, not a deployed platform.</p>
              <div className="about-tags"><span>Computer Engineering</span><span>Artificial Intelligence</span><span>Technology Strategy</span></div>
            </div>
          </div>
        </section>

        <section className="closing">
          <div className="closing-pattern" aria-hidden="true" />
          <div className="closing-content">
            <span className="mono">CARBON HORIZON / A CONCEPT FOR TRUSTED CLIMATE INTELLIGENCE</span>
            <h2>Better data is a start.<br /><em>Trust makes it useful.</em></h2>
            <p>Exploring the intersection of AI, environmental intelligence and responsible innovation.</p>
            <a href="#top" className="button button-outline">Back to the top <ArrowUpRight size={16} /></a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand" href="#top"><span className="brand-symbol"><Globe2 size={18} /></span><span>CARBON<span className="brand-light">HORIZON</span></span></a>
        <p>Executive Master capstone · Concept case study</p>
        <p className="footer-disclaimer">Scope note: Carbon Horizon is a strategic capstone concept. This page does not claim that a platform has been deployed, its outputs independently validated, or that it has delivered measured environmental impact. Technical choices and implementation pathways require further validation. Public disclosure should be confirmed with the project team and relevant institutions. The original internal report and slides are not reproduced here.</p>
        <span className="mono copyright">© 2026 · CONCEPT / NOT A LIVE SERVICE</span>
      </footer>
    </>
  );
}

export default App;