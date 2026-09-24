export type NetworkDeviceSymbolKind =
  | "host"
  | "laptop"
  | "printer"
  | "server"
  | "switch"
  | "router"
  | "access-point"
  | "firewall"
  | "modem"
  | "ont"
  | "provider";

type NetworkDeviceSymbolProps = Readonly<{
  kind: NetworkDeviceSymbolKind;
  transform?: string;
}>;

export function NetworkDeviceSymbol({ kind, transform }: NetworkDeviceSymbolProps) {
  const commonProps = {
    className: "network-topology__device-symbol",
    "data-device-symbol": kind,
    "aria-hidden": true,
    transform,
  } as const;

  if (kind === "switch") {
    return <g {...commonProps}><rect className="network-topology__device-surface" x="-34" y="-22" width="68" height="44" rx="3" /><path d="M-22 -8 H19 M19 -8 L11 -14 M19 -8 L11 -2 M22 9 H-19 M-19 9 L-11 3 M-19 9 L-11 15" /></g>;
  }
  if (kind === "router") {
    return <g {...commonProps}><circle className="network-topology__device-surface" r="28" /><path d="M-14 14 L14 -14 M14 -14 L4 -13 M14 -14 L13 -4 M14 14 L-14 -14 M-14 -14 L-4 -13 M-14 -14 L-13 -4" /></g>;
  }
  if (kind === "access-point") {
    return <g {...commonProps}><rect className="network-topology__device-surface" x="-25" y="4" width="50" height="18" rx="3" /><path d="M0 4 V-3 M-8 -8 A11 11 0 0 1 8 -8 M-16 -15 A22 22 0 0 1 16 -15" /><circle cx="17" cy="13" r="1.5" /></g>;
  }
  if (kind === "firewall") {
    return <g {...commonProps}><rect className="network-topology__device-surface" x="-31" y="-23" width="62" height="46" rx="3" /><path d="M-31 -8 H31 M-31 8 H31 M-10 -23 V-8 M12 -23 V-8 M-20 -8 V8 M2 -8 V8 M22 -8 V8 M-10 8 V23 M12 8 V23" /></g>;
  }
  if (kind === "modem") {
    return <g {...commonProps}><rect className="network-topology__device-surface" x="-31" y="-20" width="62" height="40" rx="8" /><path d="M-20 8 C-13 -5 -6 -5 0 8 C6 21 13 21 20 8 M-20 -7 H20" /><circle cx="-20" cy="14" r="2" /><circle cx="-12" cy="14" r="2" /></g>;
  }
  if (kind === "ont") {
    return <g {...commonProps}><rect className="network-topology__device-surface" x="-29" y="-24" width="58" height="48" rx="5" /><path d="M-18 -10 H18 M-18 1 H18 M-18 12 H5 M12 12 H18" /><circle cx="18" cy="12" r="2" /></g>;
  }
  if (kind === "provider") {
    return <g {...commonProps}><path className="network-topology__device-surface" d="M-29 10 C-36 -3 -25 -16 -12 -14 C-5 -27 16 -26 21 -12 C38 -10 38 15 22 18 H-18 C-25 18 -29 15 -29 10 Z" /><path d="M-17 3 H17 M8 -5 L17 3 L8 11" /></g>;
  }
  if (kind === "server") {
    return <g {...commonProps}><rect className="network-topology__device-surface" x="-25" y="-29" width="50" height="54" rx="3" /><path d="M-25 -11 H25 M-25 7 H25" /><circle cx="16" cy="-20" r="2" /><circle cx="16" cy="-2" r="2" /><circle cx="16" cy="16" r="2" /></g>;
  }
  if (kind === "laptop") {
    return <g {...commonProps}><path className="network-topology__device-surface" d="M-29 -25 H29 V12 H-29 Z" /><path d="M-29 12 H29 L37 27 H-37 Z M-12 21 H12" /></g>;
  }
  if (kind === "printer") {
    return <g {...commonProps}><rect className="network-topology__device-surface" x="-31" y="-15" width="62" height="38" rx="5" /><path d="M-20 -15 V-29 H20 V-15 M-20 10 H20 V30 H-20 Z M20 -5 H24" /></g>;
  }
  return <g {...commonProps}><rect className="network-topology__device-surface" x="-29" y="-26" width="58" height="38" rx="3" /><path d="M-11 27 H11 M0 12 V27 M-18 27 H18" /></g>;
}
