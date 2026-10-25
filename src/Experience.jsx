import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Cpu, Layers3, TrendingUp, Users, Scale } from 'lucide-react';

const work = [
  { icon: TrendingUp, title: 'Market & positioning', subtitle: 'Where the opportunity sits', output: 'Porter’s five forces + competitive positioning', body: 'We examined entry barriers, buyer power, substitutes and competition to assess the case for an institutional digital MRV platform.', takeaway: 'Technical capability needs institutional credibility and a specific customer problem.', source: 'Final report §1 · Presentation slide 5' },
  { icon: Scale, title: 'Regulation & integrity', subtitle: 'What makes evidence admissible', output: 'Compliance / voluntary market mapping', body: 'We connected the EU ETS, maritime reporting and the EU removal certification framework to the evidence and governance a platform would need.', takeaway: 'The methodology and verification process shape the product from the beginning.', source: 'Final report §2 · Presentation slides 6–10' },
  { icon: Cpu, title: 'Technical architecture', subtitle: 'From sensing to traceability', output: 'Satellite → AI / HPC → integrity layer', body: 'We designed a proposed workflow combining Sentinel optical and radar observations, biomass estimation, change detection and traceable digital records.', takeaway: 'The next step is a reproducible experiment with real bands, reference data and uncertainty estimates.', source: 'Final report §3 · Presentation slides 11–15' },
  { icon: Users, title: 'Stakeholders & economics', subtitle: 'Who uses it, who funds it', output: 'Stakeholder map + weighted revenue model comparison', body: 'We mapped public institutions, industry, finance and project developers, then compared revenue models against strategic and economic criteria.', takeaway: 'Public contracts could establish the core; data services and APIs could support later expansion.', source: 'Final report §4 · Presentation slides 16–21' },
  { icon: Layers3, title: 'Delivery & governance', subtitle: 'How a concept becomes a pilot', output: 'Three-phase adoption strategy + risk assessment', body: 'We investigated organisational ownership, integration, data accuracy, regulatory acceptance and adoption risks across the deployment pathway.', takeaway: 'A scoped pilot needs clear owners, independent review and explicit go / no-go criteria.', source: 'Final report §§5–6 · Presentation slides 20–25' },
];

export function ExperienceMotion() {
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.06 });
    document.querySelectorAll('.section').forEach(el => { el.classList.add('reveal-section'); observer.observe(el); });
    return () => observer.disconnect();
  }, []);
  return null;
}

export function OurWork() {
  const [selected, setSelected] = useState(2);
  const item = work[selected];
  const Icon = item.icon;
  return <section className="section work-section" id="work">
    <div className="section-label"><span className="mono">THE TEAM’S WORK / FIVE CONNECTED WORKSTREAMS</span><span className="section-rule" /></div>
    <div className="section-heading-row"><h2>One vision.<br /><em>Every angle explored.</em></h2><p className="section-intro">A multidisciplinary strategy study connecting technology, regulation and a viable route to adoption. Explore the work behind Carbon Horizon.</p></div>
    <div className="work-explorer"><div className="work-options" aria-label="Explore our work">
      {work.map((entry, index) => <button type="button" key={entry.title} aria-pressed={selected === index} onClick={() => setSelected(index)}><span className="mono">0{index + 1}</span><span>{entry.title}</span><ArrowUpRight size={17} /></button>)}
    </div><article className="work-detail" key={selected} aria-live="polite"><Icon size={32} strokeWidth={1.4} /><span className="mono">{item.subtitle}</span><h3>{item.output}</h3><p>{item.body}</p><div className="work-takeaway"><span className="mono">STRATEGIC TAKEAWAY</span><p>{item.takeaway}</p></div><small>{item.source}</small></article></div>
  </section>;
}

