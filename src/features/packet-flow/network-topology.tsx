import type { PacketFlowScenario, PacketFlowStep } from "./packet-flow.schema";
import { NetworkDeviceSymbol, type NetworkDeviceSymbolKind } from "./network-device-symbol";

type NetworkTopologyProps = Readonly<{
  scenario: PacketFlowScenario;
  step: PacketFlowStep;
  reducedMotion: boolean;
  electricalSignal?: Readonly<{ playing: boolean; speed: number }>;
  selectedDeviceId?: string;
  onDeviceSelect?: (deviceId: string) => void;
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

const PACKET_MARKER_VERTICAL_OFFSET = 30;

function insetLinkPoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromEnd: boolean,
): { x: number; y: number } {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  if (!distance) return from;
  const inset = Math.min(72, distance / 3);
  const ratio = inset / distance;
  return fromEnd
    ? { x: to.x - (to.x - from.x) * ratio, y: to.y - (to.y - from.y) * ratio }
    : { x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio };
}

function deviceSymbolKind(device: PacketFlowScenario["devices"][number]): NetworkDeviceSymbolKind {
  const identity = `${device.id} ${device.label} ${device.role}`.toLowerCase();
  if (identity.includes("firewall") || identity.includes("security boundary")) return "firewall";
  if (identity.includes("access point") || identity.includes("wireless bridge")) return "access-point";
  if (identity.includes("switch") || identity.includes("lan forwarding")) return "switch";
  if (identity.includes("router") || identity.includes("gateway")) return "router";
  if (identity.includes("server")) return "server";
  return "host";
}

export function NetworkTopology({
  scenario,
  step,
  reducedMotion,
  electricalSignal,
  selectedDeviceId,
  onDeviceSelect,
}: NetworkTopologyProps) {
  const devicesById = new Map(scenario.devices.map((device) => [device.id, device]));
  const packet = step.packet;
  const packetTravels = packet
    ? scenario.links.flatMap((link) => {
        if (!step.activeLinkIds.includes(link.id)) return [];
        const otherId = link.from === packet.from
          ? link.to
          : link.to === packet.from
            ? link.from
            : undefined;
        if (!otherId || (!packet.fanOut && otherId !== packet.to)) return [];
        const from = devicesById.get(packet.from);
        const to = devicesById.get(otherId);
        if (!from || !to) return [];
        const start = insetLinkPoint(from, to, false);
        const end = insetLinkPoint(from, to, true);
        return [{
          link,
          start,
          end,
        }];
      })
    : [];
  const titleId = `${scenario.id}-topology-title`;
  const descriptionId = `${scenario.id}-topology-description`;

  return (
    <div
      className={`network-topology${reducedMotion ? " network-topology--reduced-motion" : ""}`}
      data-reduced-motion={reducedMotion ? "true" : undefined}
    >
      <svg viewBox="0 0 800 270" role={onDeviceSelect ? "group" : "img"} aria-labelledby={titleId} aria-describedby={descriptionId}>
        <title id={titleId}>{scenario.title}</title>
        <desc id={descriptionId}>Topology order: {scenario.devices.map((device) => device.label).join(", ")}. Current step: {step.title}. {step.explanation}</desc>
        <g className="network-topology__links">
          {scenario.links.map((link) => {
            const from = devicesById.get(link.from);
            const to = devicesById.get(link.to);
            if (!from || !to) return null;
            const active = isLinkActive(link.id, step);

            return (
              <g key={link.id}>
                <line
                  className={`network-topology__link${active ? " network-topology__link--active" : ""}`}
                  data-active={active ? "true" : undefined}
                  data-link-id={link.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                />
              </g>
            );
          })}
        </g>
        {electricalSignal && packet ? packetTravels.map(({ link, start, end }) => (
          <path
            key={`${step.id}-${link.id}`}
            className="network-topology__electrical-signal"
            data-electrical-signal="true"
            data-link-id={link.id}
            data-from={packet.from}
            data-to={packet.to}
            data-playing={electricalSignal.playing ? "true" : "false"}
            d={`M${start.x} ${start.y} L${end.x} ${end.y}`}
            pathLength={100}
            aria-hidden="true"
            style={{ animationDuration: `${1.5 / electricalSignal.speed}s` }}
          />
        )) : null}
        {!electricalSignal && packet ? packetTravels.map(({ link, start, end }) => (
          <g
            key={`${step.id}-${link.id}`}
            className={`network-topology__packet-marker${packet.broadcast ? " network-topology__packet-marker--broadcast" : ""}${reducedMotion ? " network-topology__packet-marker--discrete" : ""}`}
            data-broadcast={packet.broadcast ? "true" : undefined}
            data-packet-marker="true"
            data-link-id={link.id}
            data-step-id={step.id}
            aria-hidden="true"
            transform={`translate(${end.x} ${end.y - PACKET_MARKER_VERTICAL_OFFSET})`}
          >
            {!reducedMotion ? (
              <animateTransform
                attributeName="transform"
                type="translate"
                from={`${start.x} ${start.y - PACKET_MARKER_VERTICAL_OFFSET}`}
                to={`${end.x} ${end.y - PACKET_MARKER_VERTICAL_OFFSET}`}
                dur="600ms"
                fill="freeze"
              />
            ) : null}
            <circle r="17" />
            <path data-packet-envelope="true" d="M-9-6h18v12H-9zM-9-4l9 7 9-7" />
          </g>
        )) : null}
        <g className="network-topology__devices">
          {scenario.devices.map((device) => {
            const active = step.activeDeviceIds.includes(device.id);
            const symbolKind = deviceSymbolKind(device);
            const selectableProps = onDeviceSelect
              ? {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": `Explore ${device.label}`,
                  "aria-pressed": selectedDeviceId === device.id,
                  onClick: () => onDeviceSelect(device.id),
                  onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onDeviceSelect(device.id);
                    }
                  },
                } as const
              : {};
            return (
              <g
                key={device.id}
                className={`network-topology__device${active ? " network-topology__device--active" : ""}`}
                data-active={active ? "true" : undefined}
                data-device-id={device.id}
                transform={`translate(${device.x} ${device.y})`}
                {...selectableProps}
              >
                <NetworkDeviceSymbol kind={symbolKind} />
                <text textAnchor="middle" y="48">{device.label}</text>
                <text className="network-topology__device-role" textAnchor="middle" y="64">{device.role}</text>
              </g>
            );
          })}
        </g>
      </svg>
      {scenario.links.some(({ fromInterface, toInterface }) => fromInterface || toInterface) ? (
        <ul aria-label="Link interfaces" className="network-topology__interfaces">
          {scenario.links.map((link) => {
            const from = devicesById.get(link.from);
            const to = devicesById.get(link.to);
            return (
              <li data-active={step.activeLinkIds.includes(link.id) || undefined} key={link.id}>
                <span>{from?.label}: <strong>{link.fromInterface ?? "interface not labelled"}</strong></span>
                <span aria-hidden="true">↔</span>
                <span>{to?.label}: <strong>{link.toInterface ?? "interface not labelled"}</strong></span>
              </li>
            );
          })}
        </ul>
      ) : null}
      <p className="network-topology__active-text">{getActiveText(scenario, step)}</p>
    </div>
  );
}
