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
        <polyline
          className="site-logo__trace"
          points="70,42 70,65 100,65 100,90 75,90 75,115 110,115 110,148"
          style={{ stroke: gradUrl }}
        />
        <circle className="site-logo__pad site-logo__pad--a" cx="70" cy="42" r="11" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--b" cx="110" cy="148" r="11" style={{ fill: gradUrl }} />
      </g>
    </svg>
  );
}
