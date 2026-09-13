type DeviceKind = "laptop" | "switch" | "router" | "cloud" | "server";

const devices: { kind: DeviceKind; label: string }[] = [
  { kind: "laptop", label: "Your device" }, { kind: "switch", label: "Switch" },
  { kind: "router", label: "Router" }, { kind: "cloud", label: "Internet" },
  { kind: "server", label: "Server" },
];

export function DeviceIcon({ kind }: { kind: DeviceKind }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "laptop") return <svg viewBox="0 0 48 48" aria-hidden="true" {...common}><rect x="7" y="9" width="34" height="24" rx="2" /><path d="M4 37h40l-3 4H7zM11 29h26" /></svg>;
  if (kind === "switch") return <svg viewBox="0 0 48 48" aria-hidden="true" {...common}><rect x="5" y="16" width="38" height="17" rx="2" /><path d="M9 29h30" /><circle cx="13" cy="23" r="1" /><circle cx="21" cy="23" r="1" /><circle cx="29" cy="23" r="1" /><circle cx="37" cy="23" r="1" /></svg>;
  if (kind === "router") return <svg viewBox="0 0 48 48" aria-hidden="true" {...common}><rect x="7" y="19" width="34" height="17" rx="2" /><path d="M14 19V8m20 11V8M11 30h26" /><circle cx="16" cy="25" r="1" /><circle cx="24" cy="25" r="1" /><path d="M12 6h4m16 0h4" /></svg>;
  if (kind === "cloud") return <svg viewBox="0 0 48 48" aria-hidden="true" {...common}><path d="M13 34a9 9 0 0 1-3-17 13 13 0 0 1 25-1 9 9 0 0 1 1 18z" /></svg>;
  return <svg viewBox="0 0 48 48" aria-hidden="true" {...common}><rect x="13" y="5" width="22" height="11" rx="1" /><rect x="13" y="19" width="22" height="11" rx="1" /><rect x="13" y="33" width="22" height="11" rx="1" /><path d="M18 10h9m-9 14h9m-9 14h9" /><circle cx="31" cy="10" r="1" /><circle cx="31" cy="24" r="1" /><circle cx="31" cy="38" r="1" /></svg>;
}

export function RouteIllustration() {
  return <div className="home-route-card" role="img" aria-label="Example packet route: your device, switch, router, internet, and server">
    <div className="home-route-title">A packet’s journey</div>
    <div className="home-route-line" aria-hidden="true">{devices.map((device, index) => <div className="home-route-segment" key={device.kind}><div className="home-route-node"><DeviceIcon kind={device.kind} /><small>{device.label}</small></div>{index < devices.length - 1 ? <i /> : null}</div>)}</div>
    <div className="home-terminal" aria-hidden="true"><div className="home-terminal-chrome"><b /><b /><b /></div><div className="home-terminal-body"><span>user@packetsecrets:~$ ping 8.8.8.8</span><br /><em>Example terminal output</em><br />64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=12.4 ms<br />64 bytes from 8.8.8.8: icmp_seq=2 ttl=117 time=11.9 ms<br />64 bytes from 8.8.8.8: icmp_seq=3 ttl=117 time=12.1 ms</div></div>
  </div>;
}
