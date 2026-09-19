"use client";

import { useId } from "react";

export function SiteLogoMark() {
  const gradId = useId();
  const gradUrl = `url(#${gradId})`;
  return (
    <svg className="site-logo__mark-svg" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--logo-grad-start, var(--accent))" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <g transform="rotate(-4 100 100)">
        <rect className="site-logo__badge-fill" x="6" y="6" width="188" height="188" rx="45" />
        <rect className="site-logo__badge-outline" x="6" y="6" width="188" height="188" rx="45" style={{ stroke: gradUrl }} />
        <polygon
          className="site-logo__trace-outer"
          points="50,45 150,45 150,155 50,155"
          style={{ stroke: gradUrl }}
        />
        <polyline
          className="site-logo__trace-inner"
          points="100,45 100,75 125,75 125,105 75,105 75,135 100,135 100,155"
          style={{ stroke: gradUrl }}
        />
        <circle className="site-logo__pad site-logo__pad--a" cx="50" cy="45" r="7" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--a" cx="100" cy="45" r="7" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--a" cx="150" cy="45" r="7" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--a" cx="150" cy="155" r="7" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--a" cx="100" cy="155" r="7" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--a" cx="50" cy="155" r="7" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--b" cx="100" cy="75" r="7" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--b" cx="125" cy="75" r="7" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--b" cx="125" cy="105" r="7" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--b" cx="75" cy="105" r="7" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--b" cx="75" cy="135" r="7" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--b" cx="100" cy="135" r="7" style={{ fill: gradUrl }} />
      </g>
    </svg>
  );
}
