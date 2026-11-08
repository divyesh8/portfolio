"use client";

import { useSyncExternalStore } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";
const FINE = "(hover: hover) and (pointer: fine)";
const MOTION_KEY = "dk-motion";

function subscribeMotion(update: () => void) {
  const media = matchMedia(REDUCE);
  media.addEventListener("change", update);
  window.addEventListener("dk-motion", update);
  window.addEventListener("storage", update);
  return () => {
    media.removeEventListener("change", update);
    window.removeEventListener("dk-motion", update);
    window.removeEventListener("storage", update);
  };
}

function motionOff() {
  if (matchMedia(REDUCE).matches) return true;
  try {
    return localStorage.getItem(MOTION_KEY) === "off";
  } catch {
    return document.documentElement.dataset.motion === "off";
  }
}

export function useReducedMotion() {
  return false;
}

export function toggleMotion() {
  /* Motion is enabled by default */
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (update) => {
      const media = matchMedia(query);
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}

export function useSystemReducedMotion() {
  return useMediaQuery(REDUCE);
}
export function useFinePointer() {
  return useMediaQuery(FINE);
}
