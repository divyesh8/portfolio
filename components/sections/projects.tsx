import { ArrowUpRight, Box, Braces, Database, Layers3, Radio, Workflow } from "lucide-react";
import { ProjectsGallery } from "@/components/sections/projects-gallery";
import { getProjects } from "@/lib/github";

const tools = [
  { name: "TypeScript", Icon: Braces }, { name: "Next.js", Icon: Layers3 }, { name: "FastAPI", Icon: Radio },
  { name: "PostgreSQL", Icon: Database }, { name: "Docker", Icon: Box }, { name: "Git", Icon: Workflow },
];

export async function Projects() {
  const projects = await getProjects();
  return (
    <section id="work" className="shell folio-work" aria-labelledby="work-title">
      <header className="chapter-bar">
        <div><p className="folio-label">01 / Selected work</p><h2 id="work-title">Selected builds<i>.</i></h2></div>
        <span className="chapter-note">Cloud, systems &amp; the web</span>
      </header>
      <ProjectsGallery projects={projects} />
      <div className="tool-band">
        <div className="tool-band-bar"><div><span className="folio-label">Built with</span><p>The tools I reach for.</p></div>
          <a href="#skills" className="micro-link">Full toolkit <ArrowUpRight size={14} /></a>
        </div>
        <ul>{tools.map(({name, Icon}) => <li key={name}><Icon aria-hidden strokeWidth={1.4} />{name}</li>)}</ul>
      </div>
    </section>
  );
}
