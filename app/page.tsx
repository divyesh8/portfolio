import dynamic from "next/dynamic";
import { Preloader } from "@/components/layout/preloader";
import { SiteChrome } from "@/components/layout/site-chrome";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { FieldNotes } from "@/components/sections/field-notes";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { Projects } from "@/components/sections/projects";
import { Journey } from "@/components/sections/journey";
import { GitHubSection } from "@/components/sections/github";
import { Profiles } from "@/components/sections/profiles";

/* Keep the résumé preview and contact form outside the initial hero bundle. */
const Resume = dynamic(() =>
  import("@/components/sections/resume").then((m) => m.Resume),
);
const Contact = dynamic(() =>
  import("@/components/sections/contact").then((m) => m.Contact),
);

export default function HomePage() {
  return (
    <>
      <Preloader />
      <SiteChrome />

      <main id="main" tabIndex={-1}>
        <Hero />
        <Projects />
        <FieldNotes />
        <About />
        <Skills />
        <Journey />
        <GitHubSection />
        <Profiles />
        <Resume />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
