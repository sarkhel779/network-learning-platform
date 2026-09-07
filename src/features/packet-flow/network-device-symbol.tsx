export type NetworkDeviceSymbolKind =
  | "host"
  | "server"
  | "switch"
  | "router"
  | "access-point"
  | "firewall";

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
  if (kind === "server") {
    return <g {...commonProps}><rect className="network-topology__device-surface" x="-25" y="-29" width="50" height="54" rx="3" /><path d="M-25 -11 H25 M-25 7 H25" /><circle cx="16" cy="-20" r="2" /><circle cx="16" cy="-2" r="2" /><circle cx="16" cy="16" r="2" /></g>;
  }
  return <g {...commonProps}><rect className="network-topology__device-surface" x="-29" y="-26" width="58" height="38" rx="3" /><path d="M-11 27 H11 M0 12 V27 M-18 27 H18" /></g>;
}
