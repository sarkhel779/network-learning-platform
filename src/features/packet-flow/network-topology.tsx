import type { PacketFlowScenario, PacketFlowStep } from "./packet-flow.schema";

type NetworkTopologyProps = Readonly<{
  scenario: PacketFlowScenario;
  step: PacketFlowStep;
  reducedMotion: boolean;
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

function packetKindLabel(label: string): string {
  if (label.startsWith("ARP")) return "ARP";
  if (label.startsWith("ICMP")) return "ICMP";
  return label;
}

type DeviceSymbolKind = "host" | "server" | "switch" | "router" | "access-point" | "firewall";

function deviceSymbolKind(device: PacketFlowScenario["devices"][number]): DeviceSymbolKind {
  const identity = `${device.id} ${device.label} ${device.role}`.toLowerCase();
  if (identity.includes("firewall") || identity.includes("security boundary")) return "firewall";
  if (identity.includes("access point") || identity.includes("wireless bridge")) return "access-point";
  if (identity.includes("switch") || identity.includes("lan forwarding")) return "switch";
  if (identity.includes("router") || identity.includes("gateway")) return "router";
  if (identity.includes("server")) return "server";
  return "host";
}

function DeviceSymbol({ kind }: Readonly<{ kind: DeviceSymbolKind }>) {
  const commonProps = {
    className: "network-topology__device-symbol",
    "data-device-symbol": kind,
    "aria-hidden": true,
  } as const;

  if (kind === "switch") {
    return (
      <g {...commonProps}>
        <rect className="network-topology__device-surface" x="-34" y="-22" width="68" height="44" rx="3" />
        <path d="M-22 -8 H19 M19 -8 L11 -14 M19 -8 L11 -2 M22 9 H-19 M-19 9 L-11 3 M-19 9 L-11 15" />
      </g>
    );
  }

  if (kind === "router") {
    return (
      <g {...commonProps}>
        <circle className="network-topology__device-surface" r="28" />
        <path d="M-14 14 L14 -14 M14 -14 L4 -13 M14 -14 L13 -4 M14 14 L-14 -14 M-14 -14 L-4 -13 M-14 -14 L-13 -4" />
      </g>
    );
  }

  if (kind === "access-point") {
    return (
      <g {...commonProps}>
        <rect className="network-topology__device-surface" x="-25" y="4" width="50" height="18" rx="3" />
        <path d="M0 4 V-3 M-8 -8 A11 11 0 0 1 8 -8 M-16 -15 A22 22 0 0 1 16 -15" />
        <circle cx="17" cy="13" r="1.5" />
      </g>
    );
  }

  if (kind === "firewall") {
    return (
      <g {...commonProps}>
        <rect className="network-topology__device-surface" x="-31" y="-23" width="62" height="46" rx="3" />
        <path d="M-31 -8 H31 M-31 8 H31 M-10 -23 V-8 M12 -23 V-8 M-20 -8 V8 M2 -8 V8 M22 -8 V8 M-10 8 V23 M12 8 V23" />
      </g>
    );
  }

  if (kind === "server") {
    return (
      <g {...commonProps}>
        <rect className="network-topology__device-surface" x="-25" y="-29" width="50" height="54" rx="3" />
        <path d="M-25 -11 H25 M-25 7 H25" />
        <circle cx="16" cy="-20" r="2" /><circle cx="16" cy="-2" r="2" /><circle cx="16" cy="16" r="2" />
      </g>
    );
  }

  return (
    <g {...commonProps}>
      <rect className="network-topology__device-surface" x="-29" y="-26" width="58" height="38" rx="3" />
      <path d="M-11 27 H11 M0 12 V27 M-18 27 H18" />
    </g>
  );
}

export function NetworkTopology({
  scenario,
  step,
  reducedMotion,
  selectedDeviceId,
  onDeviceSelect,
}: NetworkTopologyProps) {
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
  const titleId = `${scenario.id}-topology-title`;
  const descriptionId = `${scenario.id}-topology-description`;

  return (
    <div
      className={`network-topology${reducedMotion ? " network-topology--reduced-motion" : ""}`}
      data-reduced-motion={reducedMotion ? "true" : undefined}
    >
      <svg viewBox="0 0 800 240" role="img" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <title id={titleId}>{scenario.title}</title>
        <desc id={descriptionId}>Topology order: {scenario.devices.map((device) => device.label).join(", ")}. Current step: {step.title}. {step.explanation}</desc>
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
            key={step.id}
            className={`network-topology__packet-marker${step.packet.broadcast ? " network-topology__packet-marker--broadcast" : ""}${reducedMotion ? " network-topology__packet-marker--discrete" : ""}`}
            data-broadcast={step.packet.broadcast ? "true" : undefined}
            data-packet-marker="true"
            data-link-id={packetLink.id}
            data-step-id={step.id}
            aria-hidden="true"
            transform={`translate(${packetTo.x} ${packetTo.y})`}
          >
            {!reducedMotion ? (
              <animateTransform
                attributeName="transform"
                type="translate"
                from={`${packetFrom.x} ${packetFrom.y}`}
                to={`${packetTo.x} ${packetTo.y}`}
                dur="600ms"
                fill="freeze"
              />
            ) : null}
            <circle r="18" />
            <text textAnchor="middle" dy="0.35em">{packetKindLabel(step.packet.label)}</text>
          </g>
        ) : null}
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
                <DeviceSymbol kind={symbolKind} />
                <text textAnchor="middle" y="48">{device.label}</text>
                <text className="network-topology__device-role" textAnchor="middle" y="64">{device.role}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <p className="network-topology__active-text">{getActiveText(scenario, step)}</p>
    </div>
  );
}
