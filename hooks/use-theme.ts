"use client";

import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";
const STORAGE_KEY = "dk-theme";

function subscribe(update: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      document.documentElement.dataset.theme =
        event.newValue === "light" ? "light" : "dark";
      update();
    }
  };
  window.addEventListener("dk-theme", update);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("dk-theme", update);
    window.removeEventListener("storage", onStorage);
  };
}

function current(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function toggle() {
  const next = current() === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* Session-only preference. */
  }
  window.dispatchEvent(new Event("dk-theme"));
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, current, () => "dark");
  return { theme, toggle };
}
