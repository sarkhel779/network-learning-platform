import type { DhcpStep } from "./dhcp.schema";

export function DhcpTopology({ step, mode }: { step: DhcpStep; mode: "direct" | "relay" }) {
  if (mode === "direct") return <figure aria-label="Direct DHCP topology" className="dhcp-topology">
    <svg role="img" aria-label={`${step.title}: direct DHCP packet traversal`} viewBox="0 0 800 210">
      <line x1="150" y1="90" x2="650" y2="90" />
      <circle cx="130" cy="90" r="45" /><rect x="625" y="45" width="90" height="90" rx="12" />
      <text x="130" y="95" textAnchor="middle">Client</text><text x="670" y="95" textAnchor="middle">DHCP server</text>
      <text x="130" y="155" textAnchor="middle">Client interface</text><text x="670" y="155" textAnchor="middle">Server interface</text>
      <text x="400" y="70" textAnchor="middle">{step.packet.messageType} · {step.packet.udp.sourcePort} → {step.packet.udp.destinationPort}</text>
      <text x="400" y="125" textAnchor="middle">{step.packet.deliveryMode}</text>
    </svg>
  </figure>;

  return <figure aria-label="Relayed DHCP topology" className="dhcp-topology">
    <p><strong>Client broadcast domain</strong><span aria-hidden="true"> → </span><strong>Server subnet</strong></p>
    <svg role="img" aria-label={`${step.title}: relayed DHCP packet traversal`} viewBox="0 0 900 250">
      <line x1="130" y1="100" x2="420" y2="100" /><line x1="480" y1="100" x2="770" y2="100" />
      <circle cx="110" cy="100" r="45" /><rect x="405" y="55" width="90" height="90" rx="45" /><rect x="750" y="55" width="110" height="90" rx="12" />
      <text x="110" y="105" textAnchor="middle">Client</text><text x="450" y="105" textAnchor="middle">Relay</text><text x="805" y="105" textAnchor="middle">DHCP server</text>
      <text x="110" y="165" textAnchor="middle">Client interface</text><text x="450" y="165" textAnchor="middle">Client-facing / server-facing</text><text x="805" y="165" textAnchor="middle">Server interface</text>
      <text x="450" y="215" textAnchor="middle">Active: {step.packet.leg} · UDP {step.packet.udp.sourcePort} → {step.packet.udp.destinationPort}</text>
    </svg>
  </figure>;
}
