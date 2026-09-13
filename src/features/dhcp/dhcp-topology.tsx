import type { CSSProperties } from "react";
import type { DhcpStep } from "./dhcp.schema";

function Laptop({ x, y }: { x: number; y: number }) {
  return <g data-device="laptop" className="dhcp-topology__device" transform={`translate(${x} ${y})`}>
    <rect x="-35" y="-31" width="70" height="47" rx="4" /><path d="M-43 22h86l-8 9h-70z" /><path d="M-28-24h56v33h-56z" className="dhcp-topology__screen" />
  </g>;
}

function Router({ x, y }: { x: number; y: number }) {
  return <g data-device="router" className="dhcp-topology__device" transform={`translate(${x} ${y})`}>
    <rect x="-38" y="-8" width="76" height="36" rx="8" /><path d="M-22-8v-25m44 25v-25M-30-36l8 3 8-3m28 0 8 3 8-3" /><circle cx="-23" cy="10" r="2" /><circle cx="-10" cy="10" r="2" /><path d="M7 11h22" />
  </g>;
}

function Server({ x, y }: { x: number; y: number }) {
  return <g data-device="server" className="dhcp-topology__device" transform={`translate(${x} ${y})`}>
    <rect x="-33" y="-37" width="66" height="24" rx="4" /><rect x="-33" y="-9" width="66" height="24" rx="4" /><rect x="-33" y="19" width="66" height="24" rx="4" />
    <circle cx="22" cy="-25" r="2" /><circle cx="22" cy="3" r="2" /><circle cx="22" cy="31" r="2" /><path d="M-24-25h28M-24 3h28M-24 31h28" />
  </g>;
}

function Packet({ step, x1, x2, y }: { step: DhcpStep; x1: number; x2: number; y: number }) {
  return <g key={`${step.id}-${step.packet.leg}`} data-packet-leg={step.packet.leg} className="dhcp-topology__packet" style={{ "--packet-distance": `${x2 - x1}px` } as CSSProperties} transform={`translate(${x1} ${y})`}>
    <circle r="13" /><path d="M-7-5h14v10H-7zM-7-2l7 5 7-5" />
  </g>;
}

export function DhcpTopology({ step, mode }: { step: DhcpStep; mode: "direct" | "relay" }) {
  if (mode === "direct") {
    const outbound = step.packet.leg === "client-to-server";
    return <figure aria-label="Direct DHCP topology" className="dhcp-topology">
      <svg role="img" aria-label={`${step.title}: direct DHCP packet traversal`} viewBox="0 0 800 210">
        <path className="dhcp-topology__link" d="M175 92H625" />
        <Laptop x={130} y={92} /><Server x={670} y={92} />
        <Packet step={step} x1={outbound ? 185 : 615} x2={outbound ? 615 : 185} y={92} />
        <text x="130" y="165" textAnchor="middle">Client interface</text><text x="670" y="165" textAnchor="middle">Server interface</text>
        <text x="400" y="42" textAnchor="middle">{step.packet.messageType} · UDP {step.packet.udp.sourcePort} → {step.packet.udp.destinationPort}</text>
        <text x="400" y="148" textAnchor="middle">{step.packet.deliveryMode}</text>
      </svg>
    </figure>;
  }

  const leg = step.packet.leg;
  const packetPath = leg === "client-to-server" ? [165, 390] : leg === "relay-to-server" ? [510, 745] : leg === "server-to-relay" ? [745, 510] : [390, 165];
  return <figure aria-label="Relayed DHCP topology" className="dhcp-topology">
    <p><strong>Client broadcast domain</strong><span aria-hidden="true"> → </span><strong>Server subnet</strong></p>
    <svg role="img" aria-label={`${step.title}: relayed DHCP packet traversal`} viewBox="0 0 900 250">
      <path className="dhcp-topology__link" d="M160 100H400M500 100H750" />
      <Laptop x={110} y={100} /><Router x={450} y={100} /><Server x={805} y={100} />
      <Packet step={step} x1={packetPath[0]} x2={packetPath[1]} y={100} />
      <text x="110" y="170" textAnchor="middle">Client interface</text><text x="450" y="170" textAnchor="middle">Relay · two interfaces</text><text x="805" y="170" textAnchor="middle">Server interface</text>
      <text x="450" y="220" textAnchor="middle">Active: {leg} · UDP {step.packet.udp.sourcePort} → {step.packet.udp.destinationPort}</text>
    </svg>
  </figure>;
}
