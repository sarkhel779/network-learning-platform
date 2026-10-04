import type { ReactNode } from "react";

const commonProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const icons: Record<string, ReactNode> = {
  "networking-foundations": (
    <>
      <rect x="3" y="4" width="18" height="4.5" rx="1.25" />
      <rect x="3" y="9.75" width="18" height="4.5" rx="1.25" />
      <rect x="3" y="15.5" width="18" height="4.5" rx="1.25" />
    </>
  ),
  "routing-protocols": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 16 L16 8 M16 8 L11 8.5 M16 8 L15.5 13" />
    </>
  ),
  "security-protocols": (
    <path d="M12 3 L19 6 V11 C19 15.5 16 19 12 21 C8 19 5 15.5 5 11 V6 Z M9 12 L11 14 L15.5 9.5" />
  ),
  "wireless-networking": (
    <>
      <path d="M4 10 C8.5 5.5 15.5 5.5 20 10" />
      <path d="M7.5 13.5 C10.3 10.7 13.7 10.7 16.5 13.5" />
      <circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
};

const fallbackIcon = (
  <path d="M12 3 L20 7.5 V16.5 L12 21 L4 16.5 V7.5 Z M4 7.5 L12 12 L20 7.5 M12 12 V21" />
);

export function PathwayIcon({ slug }: { slug: string }) {
  return (
    <svg className="course-card__icon" {...commonProps}>
      {icons[slug] ?? fallbackIcon}
    </svg>
  );
}
