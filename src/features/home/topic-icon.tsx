export type TopicIconKind = "tcp-ip" | "osi" | "address" | "subnet" | "switch" | "routing" | "arp" | "dns" | "dhcp" | "transport" | "http";

export function TopicIcon({ kind }: { kind: TopicIconKind }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "tcp-ip" && <><rect x="4" y="4" width="16" height="3" rx="1" /><rect x="4" y="10.5" width="16" height="3" rx="1" /><rect x="4" y="17" width="16" height="3" rx="1" /></>}
    {kind === "osi" && [4, 6.7, 9.4, 12.1, 14.8, 17.5, 20.2].map((y) => <line key={y} x1="5" y1={y} x2="19" y2={y} />)}
    {kind === "address" && <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="8" cy="12" r="1.5" /><path d="M12 11h6M12 14h4" /></>}
    {kind === "subnet" && <><circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><path d="M12 7v5M12 12H5v5M12 12h7v5" /></>}
    {kind === "switch" && <><rect x="3" y="5" width="18" height="11" rx="2" /><path d="M6 11h3M12 11h3M18 11h1M6 16v3M10 16v3M14 16v3M18 16v3" /></>}
    {kind === "routing" && <path d="M12 21V11M12 11 5 4M12 11l7-7M5 4v5M5 4h5M19 4h-5M19 4v5" />}
    {kind === "arp" && <><rect x="2" y="8" width="7" height="8" rx="1" /><rect x="15" y="8" width="7" height="8" rx="1" /><path d="M9 12h6" /></>}
    {kind === "dns" && <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c-2.5 2.5-3.5 5.5-3.5 9s1 6.5 3.5 9M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9" /></>}
    {kind === "dhcp" && <><rect x="3" y="5" width="12" height="14" rx="2" /><path d="M7 9h4M7 13h4M15 12h6m-3-3 3 3-3 3" /></>}
    {kind === "transport" && <path d="M8 20V4m-3 3 3-3 3 3M16 4v16m-3-3 3 3 3-3" />}
    {kind === "http" && <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 9h20M15 15v-1a2 2 0 0 1 4 0v1" /><rect x="14" y="15" width="6" height="4" rx="1" /></>}
  </svg>;
}
