"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Database, Radio, ScanLine } from "lucide-react";
import { PROJECT_OVERRIDES } from "@/constants/content";

const stages = [
  { title: "Probe", detail: "The control plane checks checkout, inventory, and payment services concurrently. Each probe has a timeout.", Icon: ScanLine },
  { title: "Record", detail: "A health change becomes a durable event in PostgreSQL and can open an incident. Repeated failures stay on the same timeline.", Icon: Database },
  { title: "Recover", detail: "A successful probe records the service’s recovery and resolves the open incident. The history stays available for inspection.", Icon: Radio },
];

export function FieldNotes() {
  const [view, setView] = useState<"map" | "source">("map");
  const [step, setStep] = useState(0);
  const project = PROJECT_OVERRIDES.aegisops;
  return (
    <section id="inside" className="field-feature" aria-labelledby="feature-title">
      <div className="shell feature-grid">
        <div className="feature-copy">
          <p className="folio-label">Field notes / AegisOps</p>
          <h2 id="feature-title" className="type-poster">Anatomy of<br />an <em>incident.</em></h2>
          <p>What happens between a failed health check and a recovered service? Follow one incident through AegisOps.</p>
          {project.repo && <a className="micro-link" href={project.repo} target="_blank" rel="noopener noreferrer">Explore the repository <ArrowUpRight size={15} /></a>}
        </div>
        <div className="field-plate">
          <div className="field-bar"><span className="plate-label">AegisOps / Control plane</span>
            <div className="field-views" role="group" aria-label="Field note view">
              <button type="button" aria-pressed={view==="map"} onClick={() => setView("map")}>System map</button>
              <button type="button" aria-pressed={view==="source"} onClick={() => setView("source")}>Source view</button>
            </div>
          </div>
          {view==="map" ? <div className="field-drawing">
            <div className="field-ruler" aria-hidden><span>Fig. 01</span><span>Service lifecycle</span></div>
            <div className="field-nodes" role="group" aria-label="Incident stages">
              {stages.map(({ title, Icon }, i) => <button type="button" key={title} className="field-node" aria-pressed={step===i} onClick={()=>setStep(i)}>
                <span className="field-glyph"><Icon size={28} strokeWidth={1.3} aria-hidden /></span>
                <small>0{i+1}</small><b>{title}</b>
              </button>)}
            </div>
            <p className="field-caption" aria-live="polite"><strong>0{step+1} / {stages[step].title}</strong><span>{stages[step].detail}</span></p>
          </div> : <figure className="field-source"><Image src={project.image!.src} alt={project.image!.alt} width={1200} height={660} sizes="(max-width: 760px) 90vw, 58vw" /><figcaption>{project.image!.caption}</figcaption></figure>}
          <div className="field-baseline"><span>Engineering notebook</span><span>System study 001</span></div>
        </div>
      </div>
    </section>
  );
}
