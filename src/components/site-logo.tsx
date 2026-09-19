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
          points="55,50 100,45 145,50 148,95 148,150 100,155 58,150 50,100"
          style={{ stroke: gradUrl }}
        />
        <polyline
          className="site-logo__trace-inner"
          points="100,45 128,72 100,98 128,125 100,155"
          style={{ stroke: gradUrl }}
        />
        <circle className="site-logo__pad site-logo__pad--a" cx="55" cy="50" r="9" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--a" cx="100" cy="45" r="9" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--a" cx="145" cy="50" r="9" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--a" cx="148" cy="95" r="9" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--a" cx="148" cy="150" r="9" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--a" cx="100" cy="155" r="9" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--a" cx="58" cy="150" r="9" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--a" cx="50" cy="100" r="9" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--b" cx="128" cy="72" r="9" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--b" cx="100" cy="98" r="9" style={{ fill: gradUrl }} />
        <circle className="site-logo__pad site-logo__pad--b" cx="128" cy="125" r="9" style={{ fill: gradUrl }} />
      </g>
    </svg>
  );
}
