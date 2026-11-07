import { Topology } from "@/components/shared/topology";
import { ABOUT } from "@/constants/content";
import { SITE } from "@/constants/site";

export function About() {
  return (
    <section id="about" className="folio-about" aria-labelledby="about-title">
      <div className="shell">
        <div className="about-intro">
          <header><p className="folio-label">02 / Behind the work</p><h2 id="about-title" className="type-poster">Built to run.<br /><em>Built to last.</em></h2></header>
          <div><p>{ABOUT.lead}</p><p>I’m interested in what happens after the code ships: how to spot a bad configuration, trace a failure, and get a service back on its feet.</p></div>
        </div>
        <div className="about-columns">
          <div className="folio-education">
            <h3 className="folio-label">Education &amp; background</h3>
            {ABOUT.educationHistory.map((entry) => <div className="study-entry" key={entry.institution}><small>{entry.period}</small><h4>{entry.institution}</h4><p>{entry.qualification}</p></div>)}
            <div className="spoken"><span className="folio-label">Languages</span><p>{ABOUT.languages.map(({ name, level }) => <span key={name} title={level}>{name}</span>)}</p></div>
          </div>
          <Topology />
          <figure className="principle-print">
            <span className="print-quote" aria-hidden>“</span>
            <blockquote>I prefer systems I can explain and verify.</blockquote>
            <figcaption className="handwritten">{SITE.name.split(" ")[0]}</figcaption>
            <div className="print-foot"><span>Engineering principle / 01</span><span aria-hidden>✳</span></div>
          </figure>
        </div>
      </div>
    </section>
  );
}
