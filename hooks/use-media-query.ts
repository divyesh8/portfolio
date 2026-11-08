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
  return useSyncExternalStore(subscribeMotion, motionOff, () => false);
}

export function toggleMotion() {
  if (matchMedia(REDUCE).matches) return;
  const next = motionOff() ? "on" : "off";
  document.documentElement.dataset.motion = next;
  try {
    localStorage.setItem(MOTION_KEY, next);
  } catch {
    /* Session-only preference. */
  }
  window.dispatchEvent(new Event("dk-motion"));
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
