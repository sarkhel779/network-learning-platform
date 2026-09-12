"use client";

import { useEffect, useState } from "react";

type ThemePreference = "light" | "dark";
const storageKey = "packetsecrets-theme";

function applyTheme(theme: ThemePreference) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>("dark");

  useEffect(() => {
    let preference: ThemePreference = "dark";
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "light" || saved === "dark") preference = saved;
    } catch {
      // Storage can be unavailable; the dark default remains usable.
    }
    setTheme(preference);
    applyTheme(preference);
  }, []);

  function updateTheme(preference: ThemePreference) {
    setTheme(preference);
    applyTheme(preference);
    try {
      localStorage.setItem(storageKey, preference);
    } catch {
      // The chosen theme still applies for this page without persistence.
    }
  }

  return (
    <button
      type="button"
      className="theme-control"
      role="switch"
      aria-label="Dark mode"
      aria-checked={theme === "dark"}
      onClick={() => updateTheme(theme === "dark" ? "light" : "dark")}
    >
      <span className="theme-control__label" data-active={theme === "light"}>Light</span>
      <span className="theme-control__track" aria-hidden="true"><span className="theme-control__thumb" /></span>
      <span className="theme-control__label" data-active={theme === "dark"}>Dark</span>
    </button>
  );
}
