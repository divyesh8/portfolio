"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import {
  BackToTop,
  CustomCursor,
  ScrollProgress,
} from "@/components/layout/chrome";

/**
 * Single client boundary for everything that floats above the page. Keeping
 * it in one place means app/layout.tsx and every section stay server
 * components.
 */
export function SiteChrome() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <CustomCursor />
      <Navbar onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <BackToTop />
    </>
  );
}
