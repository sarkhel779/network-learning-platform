import type { PacketFlowScenario, PacketFlowStep } from "./packet-flow.schema";

type NetworkTopologyProps = Readonly<{
  scenario: PacketFlowScenario;
  step: PacketFlowStep;
  reducedMotion: boolean;
}>;

function isLinkActive(linkId: string, step: PacketFlowStep): boolean {
  return step.activeLinkIds.includes(linkId);
}

function getActiveText(scenario: PacketFlowScenario, step: PacketFlowStep): string {
  const deviceNames = scenario.devices
    .filter((device) => step.activeDeviceIds.includes(device.id))
    .map((device) => device.label);
  const linkNames = scenario.links
    .filter((link) => step.activeLinkIds.includes(link.id))
    .map((link) => {
      const from = scenario.devices.find((device) => device.id === link.from);
      const to = scenario.devices.find((device) => device.id === link.to);
      return from && to ? `${from.label} to ${to.label}` : link.id;
    });
  const parts = [deviceNames.join(", "), linkNames.length ? `link ${linkNames.join(", ")}` : ""].filter(Boolean);

  return `Active: ${parts.join("; ") || "none"}`;
}

function packetKindLabel(label: string): string {
  if (label.startsWith("ARP")) return "ARP";
  if (label.startsWith("ICMP")) return "ICMP";
  return label;
}

export function NetworkTopology({ scenario, step, reducedMotion }: NetworkTopologyProps) {
  const devicesById = new Map(scenario.devices.map((device) => [device.id, device]));
  const packetLink = step.packet
    ? scenario.links.find(
        (link) =>
          step.activeLinkIds.includes(link.id) &&
          ((link.from === step.packet!.from && link.to === step.packet!.to) ||
            (link.from === step.packet!.to && link.to === step.packet!.from)),
      )
    : undefined;
  const packetFrom = step.packet ? devicesById.get(step.packet.from) : undefined;
  const packetTo = step.packet ? devicesById.get(step.packet.to) : undefined;
  const markerX = packetFrom && packetTo ? (reducedMotion ? packetTo.x : (packetFrom.x + packetTo.x) / 2) : 0;
  const markerY = packetFrom && packetTo ? (reducedMotion ? packetTo.y : (packetFrom.y + packetTo.y) / 2) : 0;
  const titleId = `${scenario.id}-topology-title`;
  const descriptionId = `${scenario.id}-topology-description`;

  return (
    <div
      className={`network-topology${reducedMotion ? " network-topology--reduced-motion" : ""}`}
      data-reduced-motion={reducedMotion ? "true" : undefined}
    >
      <svg viewBox="0 0 800 240" role="img" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <title id={titleId}>{scenario.title}</title>
        <desc id={descriptionId}>Topology order: {scenario.devices.map((device) => device.label).join(", ")}. Current step: {step.title}.</desc>
        <g className="network-topology__links">
          {scenario.links.map((link) => {
            const from = devicesById.get(link.from);
            const to = devicesById.get(link.to);
            if (!from || !to) return null;
            const active = isLinkActive(link.id, step);

            return (
              <line
                key={link.id}
                className={`network-topology__link${active ? " network-topology__link--active" : ""}`}
                data-active={active ? "true" : undefined}
                data-link-id={link.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
              />
            );
          })}
        </g>
        {packetLink && packetFrom && packetTo && step.packet ? (
          <g
            className={`network-topology__packet-marker${step.packet.broadcast ? " network-topology__packet-marker--broadcast" : ""}${reducedMotion ? " network-topology__packet-marker--discrete" : ""}`}
            data-broadcast={step.packet.broadcast ? "true" : undefined}
            data-packet-marker="true"
            data-link-id={packetLink.id}
            aria-hidden="true"
            transform={`translate(${markerX} ${markerY})`}
          >
            <circle r="18" />
            <text textAnchor="middle" dy="0.35em">{packetKindLabel(step.packet.label)}</text>
          </g>
        ) : null}
        <g className="network-topology__devices">
          {scenario.devices.map((device) => {
            const active = step.activeDeviceIds.includes(device.id);
            return (
              <g
                key={device.id}
                className={`network-topology__device${active ? " network-topology__device--active" : ""}`}
                data-active={active ? "true" : undefined}
                data-device-id={device.id}
                transform={`translate(${device.x} ${device.y})`}
              >
                <circle r="26" />
                <text textAnchor="middle" y="42">{device.label}</text>
                <text className="network-topology__device-role" textAnchor="middle" y="58">{device.role}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <p className="network-topology__active-text">{getActiveText(scenario, step)}</p>
    </div>
  );
}
