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
        <line className="site-logo__conn" x1="68" y1="100" x2="143" y2="100" style={{ stroke: gradUrl }} />
        <line className="site-logo__branch" x1="143" y1="100" x2="141.93" y2="75.98" style={{ stroke: gradUrl }} />
        <line className="site-logo__branch" x1="143" y1="100" x2="141.93" y2="124.02" style={{ stroke: gradUrl }} />
        <circle className="site-logo__dot site-logo__dot--a" cx="56" cy="100" r="21" style={{ fill: gradUrl }} />
        <circle className="site-logo__dot site-logo__dot--b" cx="141" cy="55" r="21" style={{ fill: gradUrl }} />
        <circle className="site-logo__dot site-logo__dot--c" cx="141" cy="145" r="21" style={{ fill: gradUrl }} />
      </g>
    </svg>
  );
}
