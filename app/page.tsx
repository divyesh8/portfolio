"use client";

import { useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { Portfolio } from "@/components/sections/portfolio";
import { Breakdown } from "@/components/sections/breakdown";
import { About } from "@/components/sections/about";
import { Journey } from "@/components/sections/journey";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/layout/footer";
import { ProjectDialog } from "@/components/shared/project-dialog";
import { VisitorBeacon } from "@/components/layout/visitor-beacon";
import { useReducedMotion } from "@/hooks/use-media-query";

export default function HomePage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <>
      <a className="skip-link" href="#portfolio">
        Skip to work
      </a>

      {/* Top red reading progress bar */}
      <motion.div
        className="reading-progress"
        style={{ scaleX: reduced ? scrollYProgress : scaleX }}
      />

      {/* Header */}
      <Navbar />

      {/* Main Sections matching Touquir Akhtar */}
      <main>
        <Hero onSelectProject={setSelectedSlug} />
        <Portfolio onSelectProject={setSelectedSlug} />
        <Breakdown />
        <About />
        <Journey onSelectProject={setSelectedSlug} />
        <Contact onSelectProject={setSelectedSlug} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal Dialog */}
      <ProjectDialog
        slug={selectedSlug}
        onClose={() => setSelectedSlug(null)}
      />

      {/* Live Visitor & Activity Telemetry */}
      <VisitorBeacon />
    </>
  );
}
