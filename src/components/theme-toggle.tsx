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
      <span className="theme-control__track" aria-hidden="true">
        <span className="theme-control__thumb">
          {theme === "dark" ? (
            <svg data-theme-icon="moon" viewBox="0 0 20 20" fill="none"><path d="M15.8 12.8A6.4 6.4 0 0 1 7.2 4.2 6.4 6.4 0 1 0 15.8 12.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
          ) : (
            <svg data-theme-icon="sun" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3.1" stroke="currentColor" strokeWidth="1.6" /><path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4m8.8 8.8 1.4 1.4m0-11.6-1.4 1.4m-8.8 8.8-1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          )}
        </span>
      </span>
      <span className="theme-control__label" data-active={theme === "dark"}>Dark</span>
    </button>
  );
}
