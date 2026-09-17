import type { ReactNode } from "react";

export type AdminIconName =
  | "overview"
  | "users"
  | "waitlist"
  | "courses"
  | "billing"
  | "support"
  | "roles"
  | "audit"
  | "settings"
  | "pulse"
  | "eye";

const paths: Record<AdminIconName, ReactNode> = {
  overview: <>
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="7" width="4" height="14" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </>,
  users: <>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
  </>,
  waitlist: <path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6z" />,
  courses: <>
    <path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v15H5.5C4.7 19 4 18.3 4 17.5z" />
    <path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v15h6.5c.8 0 1.5-.7 1.5-1.5z" />
  </>,
  billing: <>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="6" y1="14.5" x2="10" y2="14.5" />
  </>,
  support: <>
    <path d="M4 5h16v10H9l-4 4V5z" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="12" x2="13" y2="12" />
  </>,
  roles: <path d="M12 3l7 3v5c0 5-3.2 8.5-7 10-3.8-1.5-7-5-7-10V6z" />,
  audit: <>
    <rect x="6" y="4" width="12" height="17" rx="2" />
    <path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
    <line x1="9" y1="10" x2="15" y2="10" />
    <line x1="9" y1="14" x2="15" y2="14" />
    <line x1="9" y1="18" x2="12" y2="18" />
  </>,
  settings: <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </>,
  pulse: <path d="M3 12h4l2-7 4 14 2-7h6" />,
  eye: <>
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
    <circle cx="12" cy="12" r="2.5" />
  </>,
};

export function AdminIcon({ name }: { name: AdminIconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
