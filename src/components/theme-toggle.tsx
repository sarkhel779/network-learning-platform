"use client";

import { useEffect, useState } from "react";

type ThemePreference = "system" | "light" | "dark";
const storageKey = "packetsecrets-theme";

function applyTheme(theme: ThemePreference) {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>("system");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const preference: ThemePreference = saved === "light" || saved === "dark" ? saved : "system";
    setTheme(preference);
    applyTheme(preference);
  }, []);

  function updateTheme(preference: ThemePreference) {
    setTheme(preference);
    localStorage.setItem(storageKey, preference);
    applyTheme(preference);
  }

  return (
    <label className="theme-control">
      <span aria-hidden="true">◐</span>
      <span className="sr-only">Color theme</span>
      <select value={theme} onChange={(event) => updateTheme(event.target.value as ThemePreference)} aria-label="Color theme">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
