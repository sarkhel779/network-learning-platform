"use client";

import { useCallback, useState, type CSSProperties } from "react";

import { PacketFlowPlayer } from "@/features/packet-flow/packet-flow-player";
import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

const deviceDetails = {
  laptop: { name: "Laptop", role: "Host", description: "Creates a request and receives the response.", example: "A learner opens a website in a browser." },
  workstation: { name: "Workstation", role: "Host", description: "Receives local traffic as another endpoint on the network.", example: "A desktop computer receives a frame sent across the LAN." },
  printer: { name: "Printer", role: "Host", description: "Provides a service to other devices on the local network.", example: "A laptop sends a print job to a network printer." },
  hub: { name: "Hub", role: "Shared connector", description: "Repeats the incoming signal out of every other port.", example: "All attached hosts see the repeated signal, even when only one host needs it." },
  bridge: { name: "Bridge", role: "Segment connector", description: "Connects two LAN segments and filters traffic between them.", example: "Two small Ethernet segments can operate as one local network." },
  switch: { name: "Switch", role: "LAN connector", description: "Connects local devices and forwards a frame toward the appropriate port.", example: "A classroom switch connects laptops and a network printer." },
  router: { name: "Router", role: "Network boundary", description: "Connects different networks and forwards traffic beyond the local network.", example: "A home router is the path from the home LAN to the Internet." },
  internet: { name: "Internet", role: "Network of networks", description: "Represents the connected networks between a local router and a remote service.", example: "Provider networks carry the request toward a website." },
  server: { name: "Server", role: "Service host", description: "Provides information or a service when another host requests it.", example: "A web server returns the page requested by the laptop." },
} as const;

type DeviceId = keyof typeof deviceDetails;
type ScenarioId = "hub" | "bridge" | "switch" | "router";
const TOUR_STEP_DURATION_MS = 5200;

type TourDefinition = Readonly<{
  label: string;
  scenario: PacketFlowScenario;
  stepDeviceIds: readonly DeviceId[];
}>;

function step(deviceId: DeviceId, previousDeviceId?: DeviceId, linkId?: string, activeLinkIds?: readonly string[]) {
  const details = deviceDetails[deviceId];
  return {
    id: `visit-${deviceId}`,
    title: `Meet the ${details.name}`,
    explanation: details.description,
    durationMs: TOUR_STEP_DURATION_MS,
    activeDeviceIds: [deviceId],
    activeLinkIds: activeLinkIds ?? (linkId ? [linkId] : []),
    packet: previousDeviceId && linkId ? { kind: "frame" as const, label: "Teaching frame", from: previousDeviceId, to: deviceId } : undefined,
    summaryFields: [
      { label: "Current stop", value: details.name, layer: "context" as const },
      { label: "Broad role", value: details.role, layer: "context" as const },
    ],
    detailFields: [],
  };
}

function hubReceiptStep(deviceId: "workstation" | "printer") {
  const details = deviceDetails[deviceId];
  return {
    id: `inspect-${deviceId}-receipt`,
    title: `Meet the ${details.name}`,
    explanation: details.description,
    durationMs: TOUR_STEP_DURATION_MS,
    activeDeviceIds: [deviceId],
    activeLinkIds: ["hub-workstation", "hub-printer"],
    packet: { kind: "frame" as const, label: "Received teaching frame", from: "hub", to: deviceId, fanOut: true, settled: true },
    summaryFields: [
      { label: "Current stop", value: details.name, layer: "context" as const },
      { label: "Broad role", value: details.role, layer: "context" as const },
    ],
    detailFields: [],
  };
}

const tours: Record<ScenarioId, TourDefinition> = {
  hub: {
    label: "Hub",
    stepDeviceIds: ["laptop", "hub", "hub", "workstation", "printer"],
    scenario: parsePacketFlowScenario({
      id: "hub-network-example",
      title: "Hub network example",
      description: "See how a hub repeats one host's signal toward every other attached host.",
      defaultSpeed: 1,
      devices: [
        { id: "laptop", label: "Laptop", role: "sending host", x: 105, y: 145 },
        { id: "hub", label: "Hub", role: "shared connector", x: 390, y: 145 },
        { id: "workstation", label: "Workstation", role: "host", x: 680, y: 80 },
        { id: "printer", label: "Printer", role: "host", x: 680, y: 210 },
      ],
      links: [
        { id: "laptop-hub", from: "laptop", to: "hub" },
        { id: "hub-workstation", from: "hub", to: "workstation" },
        { id: "hub-printer", from: "hub", to: "printer" },
      ],
      steps: [
        step("laptop"),
        step("hub", "laptop", "laptop-hub"),
        {
          id: "hub-repeat",
          title: "Hub repeats the signal",
          explanation: "The hub repeats the signal toward every attached host at the same time.",
          durationMs: TOUR_STEP_DURATION_MS,
          activeDeviceIds: ["hub", "workstation", "printer"],
          activeLinkIds: ["hub-workstation", "hub-printer"],
          packet: { kind: "frame", label: "Repeated teaching frame", from: "hub", to: "workstation", fanOut: true },
          summaryFields: [
            { label: "Current stop", value: "Hub", layer: "context" },
            { label: "Broad role", value: "Repeats to all other ports", layer: "context" },
          ],
          detailFields: [],
        },
        hubReceiptStep("workstation"),
        hubReceiptStep("printer"),
      ],
    }),
  },
  bridge: {
    label: "Bridge",
    stepDeviceIds: ["laptop", "bridge", "workstation"],
    scenario: parsePacketFlowScenario({
      id: "bridge-network-example",
      title: "Bridge network example",
      description: "See how a bridge connects two local Ethernet segments.",
      defaultSpeed: 1,
      devices: [
        { id: "laptop", label: "Segment A host", role: "host", x: 120, y: 145 },
        { id: "bridge", label: "Bridge", role: "segment connector", x: 400, y: 145 },
        { id: "workstation", label: "Segment B host", role: "host", x: 680, y: 145 },
      ],
      links: [
        { id: "laptop-bridge", from: "laptop", to: "bridge" },
        { id: "bridge-workstation", from: "bridge", to: "workstation" },
      ],
      steps: [step("laptop"), step("bridge", "laptop", "laptop-bridge"), step("workstation", "bridge", "bridge-workstation")],
    }),
  },
  switch: {
    label: "Switch",
    stepDeviceIds: ["laptop", "switch", "printer"],
    scenario: parsePacketFlowScenario({
      id: "switch-network-example",
      title: "Switch network example",
      description: "See how a switch connects hosts on one modern local network.",
      defaultSpeed: 1,
      devices: [
        { id: "laptop", label: "Laptop", role: "sending host", x: 120, y: 145 },
        { id: "switch", label: "Switch", role: "LAN connector", x: 400, y: 145 },
        { id: "printer", label: "Printer", role: "receiving host", x: 680, y: 145 },
      ],
      links: [
        { id: "laptop-switch", from: "laptop", to: "switch" },
        { id: "switch-printer", from: "switch", to: "printer" },
      ],
      steps: [step("laptop"), step("switch", "laptop", "laptop-switch"), step("printer", "switch", "switch-printer")],
    }),
  },
  router: {
    label: "Router and Internet",
    stepDeviceIds: ["laptop", "switch", "router", "internet", "server"],
    scenario: parsePacketFlowScenario({
      id: "router-and-internet-example",
      title: "Router and Internet example",
      description: "See the broad path from a local host to a server on another network.",
      defaultSpeed: 1,
      devices: [
        { id: "laptop", label: "Laptop", role: "host", x: 70, y: 145 },
        { id: "switch", label: "Switch", role: "LAN connector", x: 230, y: 145 },
        { id: "router", label: "Router", role: "network boundary", x: 390, y: 145 },
        { id: "internet", label: "Internet", role: "provider cloud", x: 560, y: 145 },
        { id: "server", label: "Server", role: "service host", x: 730, y: 145 },
      ],
      links: [
        { id: "laptop-switch", from: "laptop", to: "switch" },
        { id: "switch-router", from: "switch", to: "router" },
        { id: "router-internet", from: "router", to: "internet" },
        { id: "internet-server", from: "internet", to: "server" },
      ],
      steps: [
        step("laptop"),
        step("switch", "laptop", "laptop-switch"),
        step("router", "switch", "switch-router"),
        step("internet", "router", "router-internet"),
        step("server", "internet", "internet-server"),
      ],
    }),
  },
};

export function DeviceRoleIdentifier() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("hub");
  const [hasStarted, setHasStarted] = useState(false);
  const tour = tours[scenarioId];
  const [selectedDeviceId, setSelectedDeviceId] = useState<DeviceId>(tour.stepDeviceIds[0]);
  const selected = deviceDetails[selectedDeviceId];
  const selectedTopologyDevice = tour.scenario.devices.find(({ id }) => id === selectedDeviceId);
  const deviceStepIndexes = tour.stepDeviceIds.reduce<Record<string, number>>((indexes, deviceId, stepIndex) => {
    if (indexes[deviceId] === undefined) indexes[deviceId] = stepIndex;
    return indexes;
  }, {});

  const handleStepChange = useCallback((stepIndex: number) => {
    setSelectedDeviceId(tours[scenarioId].stepDeviceIds[stepIndex]);
  }, [scenarioId]);

  const selectScenario = (nextScenarioId: ScenarioId) => {
    if (nextScenarioId === scenarioId) return;
    setScenarioId(nextScenarioId);
    setHasStarted(false);
    setSelectedDeviceId(tours[nextScenarioId].stepDeviceIds[0]);
  };

  const cloud = (
    <aside
      className="device-role-tour__cloud"
      data-device-id={selectedDeviceId}
      key={`${scenarioId}-${selectedDeviceId}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{ "--device-role-cloud-anchor": `${(selectedTopologyDevice?.x ?? 400) / 8}%` } as CSSProperties}
    >
      <svg aria-hidden="true" className="device-role-tour__cloud-shape" preserveAspectRatio="none" viewBox="0 0 330 250">
        <path d="M65 192 C34 195 21 164 40 143 C19 121 34 89 63 87 C57 55 88 34 116 48 C132 18 171 17 190 42 C212 15 249 24 259 54 C289 49 307 80 293 105 C316 126 307 161 279 171 C273 199 238 211 213 194 C195 221 154 225 134 199 C108 218 76 211 65 192 Z" />
        <circle cx="52" cy="211" r="13" />
        <circle cx="34" cy="228" r="8" />
        <circle cx="20" cy="240" r="5" />
      </svg>
      <div className="device-role-tour__cloud-content">
        <p className="device-role-tour__eyebrow">{selected.role}</p>
        <h4>{selected.name}</h4>
        <p>{selected.description}</p>
        <p><strong>Example:</strong> {selected.example}</p>
      </div>
    </aside>
  );

  return (
    <section className="network-basics-exercise device-role-tour" aria-labelledby="device-role-title">
      <h3 id="device-role-title">Identify device roles</h3>
      <p>Choose one network example. Each view teaches one device arrangement without placing older and modern connectors in the same path.</p>
      <div className="device-role-tour__scenarios" aria-label="Choose a network example" role="group">
        {(Object.entries(tours) as [ScenarioId, TourDefinition][]).map(([id, definition]) => (
          <button aria-pressed={scenarioId === id} className="network-basics-exercise__control" data-selected={scenarioId === id || undefined} key={id} onClick={() => selectScenario(id)} type="button">{definition.label}</button>
        ))}
      </div>
      <PacketFlowPlayer
        allowMotionOverride
        autoplay={false}
        deviceStepIndexes={deviceStepIndexes}
        key={tour.scenario.id}
        onDeviceSelect={(deviceId) => setSelectedDeviceId(deviceId as DeviceId)}
        onPlaybackStart={() => setHasStarted(true)}
        onStepChange={handleStepChange}
        packetMotion="dhcp-css"
        packetTravelDurationMs={1500}
        scenario={tour.scenario}
        selectedDeviceId={selectedDeviceId}
        showStepSummary={false}
        suppressHeading
        topologyOverlay={hasStarted ? cloud : null}
      />
    </section>
  );
}
