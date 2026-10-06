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
  "nat-port-forwarding": (
    <>
      <path d="M4 8 H15 M12 5 L15 8 L12 11" />
      <path d="M20 16 H9 M12 13 L9 16 L12 19" />
    </>
  ),
  "vlans-trunking": (
    <>
      <rect x="3" y="4" width="7" height="7" rx="1" />
      <rect x="14" y="4" width="7" height="7" rx="1" />
      <rect x="8.5" y="14" width="7" height="7" rx="1" />
      <path d="M6.5 11 V12.5 H17.5 V11 M12 12.5 V14" />
    </>
  ),
  "access-control-lists": (
    <>
      <path d="M4 5 H20 L14 13 V19 L10 21 V13 Z" />
    </>
  ),
  "dns-resolution": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12 H20.5 M12 3.5 C9 7 9 17 12 20.5 M12 3.5 C15 7 15 17 12 20.5" />
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
