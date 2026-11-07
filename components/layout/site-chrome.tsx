"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { BackToTop, ScrollProgress } from "@/components/layout/chrome";

/**
 * Single client boundary for everything that floats above the page. Keeping
 * it in one place means app/layout.tsx and every section stay server
 * components.
 */
export function SiteChrome() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <>
      <ScrollProgress />
      <Navbar onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <BackToTop />
    </>
  );
}
