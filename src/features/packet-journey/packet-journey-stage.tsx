import { NetworkDeviceSymbol } from "@/features/packet-flow/network-device-symbol";
import type { NetworkDeviceSymbolKind } from "@/features/packet-flow/network-device-symbol";

import type { PacketJourney, PacketJourneyDevice, PacketJourneyStage, PacketLayer } from "./packet-journey.types";

const positions: Record<string, { x: number; y: number }> = {
  source: { x: 75, y: 70 },
  intermediary: { x: 300, y: 70 },
  router: { x: 300, y: 70 },
  destination: { x: 525, y: 70 },
};

function symbolKind(device: PacketJourneyDevice): NetworkDeviceSymbolKind {
  return device.kind === "hub" || device.kind === "bridge" ? "switch" : device.kind;
}

function Layer({ layer, children }: { layer: PacketLayer; children?: React.ReactNode }) {
  return (
    <section className="packet-journey-layer" data-layer={layer.kind}>
      <h4>{layer.label}</h4>
      <dl>
        {layer.fields.map((field) => (
          <div data-changed={field.changed || undefined} key={field.label}>
            <dt>{field.label}</dt><dd>{field.value}</dd>
            {field.changed ? <span>Changed at this hop</span> : null}
          </div>
        ))}
      </dl>
      {children}
    </section>
  );
}

function NestedLayers({ layers }: { layers: readonly PacketLayer[] }) {
  const ordered = [...layers].sort((left, right) => (
    { ethernet: 0, ip: 1, application: 2 }[left.kind] - { ethernet: 0, ip: 1, application: 2 }[right.kind]
  ));
  return ordered.reduceRight<React.ReactNode>((child, layer) => <Layer layer={layer}>{child}</Layer>, null);
}

export function PacketJourneyStageView({ journey, stage }: { journey: PacketJourney; stage: PacketJourneyStage }) {
  const activePosition = positions[stage.activeDeviceId] ?? positions.source;
  return (
    <div className="packet-journey-stage" data-position={stage.position}>
      <div aria-label={journey.accessibleName} className="packet-journey-topology" role="img">
        <svg aria-hidden="true" viewBox="0 0 600 145">
          <path className="packet-journey-link" d="M105 70 H270" data-active-link={stage.activeLinkId === "source-router" || stage.activeLinkId === "source-destination" ? stage.activeLinkId : undefined} />
          <path className="packet-journey-link" d="M330 70 H495" data-active-link={stage.activeLinkId === "router-destination" ? stage.activeLinkId : undefined} />
          {journey.devices.map((device) => {
            const position = positions[device.id] ?? positions.intermediary;
            return (
              <g data-active-device={device.id === stage.activeDeviceId ? device.id : undefined} key={device.id}>
                <NetworkDeviceSymbol kind={symbolKind(device)} transform={`translate(${position.x} ${position.y})`} />
                <text x={position.x} y="125" textAnchor="middle">{device.label}</text>
              </g>
            );
          })}
          <circle aria-hidden="true" className="packet-journey-marker" cx={activePosition.x} cy={activePosition.y} data-packet-marker="true" r="8" />
        </svg>
        <ul className="packet-journey-interfaces">
          {journey.devices.flatMap((device) => device.interfaces.map((label) => <li data-active={label === stage.activeInterfaceId || undefined} key={label}>{label}</li>))}
        </ul>
      </div>
      <div className="packet-journey-envelope">
        <NestedLayers layers={stage.layers} />
      </div>
    </div>
  );
}
