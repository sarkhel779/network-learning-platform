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
  "packet-forwarding": (
    <>
      <rect x="3" y="10.5" width="7" height="3" rx="0.75" />
      <rect x="14" y="10.5" width="7" height="3" rx="0.75" />
      <path d="M10 12 H14 M12 12 L9.5 9.5 M12 12 L9.5 14.5" />
    </>
  ),
  "ip-subnetting": (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M3 10 H21 M9 10 V20" />
    </>
  ),
};

const fallbackIcon = (
  <path d="M12 3 L20 7.5 V16.5 L12 21 L4 16.5 V7.5 Z M4 7.5 L12 12 L20 7.5 M12 12 V21" />
);

export function TopicIcon({ slug }: { slug: string }) {
  return (
    <svg className="course-card__icon" {...commonProps}>
      {icons[slug] ?? fallbackIcon}
    </svg>
  );
}
