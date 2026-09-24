"use client";

import { useState, type CSSProperties } from "react";

import { PacketFlowPlayer } from "@/features/packet-flow/packet-flow-player";
import { parsePacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

const STEP_DURATION_MS = 3200;
const PACKET_TRAVEL_DURATION_MS = 1500;

const hubScenario = parsePacketFlowScenario({
  id: "introductory-hub-repeater",
  title: "One shared hub network",
  description: "Follow one laptop signal as the hub repeats it toward every other connected host.",
  defaultSpeed: 1,
  devices: [
    { id: "laptop", label: "Laptop", role: "sending host", x: 95, y: 135 },
    { id: "hub", label: "Hub", role: "shared connector", x: 360, y: 135 },
    { id: "workstation", label: "Workstation", role: "host", x: 690, y: 50 },
    { id: "printer", label: "Printer", role: "host", x: 690, y: 135 },
    { id: "server", label: "Server", role: "intended host", x: 690, y: 220 },
  ],
  links: [
    { id: "laptop-hub", from: "laptop", to: "hub" },
    { id: "hub-workstation", from: "hub", to: "workstation" },
    { id: "hub-printer", from: "hub", to: "printer" },
    { id: "hub-server", from: "hub", to: "server" },
  ],
  steps: [
    {
      id: "laptop-prepares-signal",
      title: "Laptop prepares a signal",
      explanation: "The laptop has information to send to the server.",
      durationMs: STEP_DURATION_MS,
      activeDeviceIds: ["laptop"], activeLinkIds: [],
      summaryFields: [{ label: "Current device", value: "Laptop", layer: "context" }], detailFields: [],
    },
    {
      id: "signal-reaches-hub",
      title: "Signal reaches the hub",
      explanation: "One signal travels along the cable from the laptop to the hub.",
      durationMs: STEP_DURATION_MS,
      activeDeviceIds: ["laptop", "hub"], activeLinkIds: ["laptop-hub"],
      packet: { kind: "frame", label: "Teaching signal", from: "laptop", to: "hub" },
      summaryFields: [{ label: "Current device", value: "Hub", layer: "context" }], detailFields: [],
    },
    {
      id: "hub-repeats-signal",
      title: "Hub repeats the signal",
      explanation: "The hub sends a copy through every other active port at the same time.",
      durationMs: STEP_DURATION_MS,
      activeDeviceIds: ["hub", "workstation", "printer", "server"],
      activeLinkIds: ["hub-workstation", "hub-printer", "hub-server"],
      packet: { kind: "frame", label: "Repeated signal", from: "hub", to: "server", fanOut: true },
      summaryFields: [{ label: "Hub action", value: "Repeat to all other ports", layer: "context" }], detailFields: [],
    },
    {
      id: "hosts-handle-copies",
      title: "Every host receives a copy",
      explanation: "The server accepts the signal meant for it. The workstation and printer receive copies but do not use them.",
      durationMs: STEP_DURATION_MS,
      activeDeviceIds: ["server"], activeLinkIds: ["hub-workstation", "hub-printer", "hub-server"],
      packet: { kind: "frame", label: "Received signal copies", from: "hub", to: "server", fanOut: true, settled: true },
      summaryFields: [{ label: "Intended host", value: "Server", layer: "context" }], detailFields: [],
    },
  ],
});

const bubbleByStep = [
  { deviceId: "laptop", eyebrow: "Sending host", title: "Laptop sends one signal", description: "The laptop begins one transmission intended for the server." },
  { deviceId: "hub", eyebrow: "Shared connector", title: "The hub receives it", description: "The signal enters one hub port. The hub does not identify its destination." },
  { deviceId: "hub", eyebrow: "Repeater", title: "The hub makes no choice", description: "It repeats the signal through all three other active ports." },
  { deviceId: "server", eyebrow: "Intended host", title: "Server accepts the signal meant for it", description: "Every host received a copy, but only the intended server uses this one." },
] as const;

function HubTeachingBubble({ stepIndex, visible }: Readonly<{ stepIndex: number; visible: boolean }>) {
  if (!visible) return null;
  const bubble = bubbleByStep[stepIndex] ?? bubbleByStep[0];
  const device = hubScenario.devices.find(({ id }) => id === bubble.deviceId);
  if (!device) return null;
  const style = { "--hub-bubble-anchor": `${device.x / 8}%` } as CSSProperties;

  return (
    <aside aria-atomic="true" aria-live="polite" className="hub-repeater__cloud" role="status" style={style}>
      <svg aria-hidden="true" className="hub-repeater__cloud-shape" preserveAspectRatio="none" viewBox="0 0 330 250">
        <path d="M65 192 C34 195 21 164 40 143 C19 121 34 89 63 87 C57 55 88 34 116 48 C132 18 171 17 190 42 C212 15 249 24 259 54 C289 49 307 80 293 105 C316 126 307 161 279 171 C273 199 238 211 213 194 C195 221 154 225 134 199 C108 218 76 211 65 192 Z" />
        <circle cx="52" cy="211" r="13" /><circle cx="34" cy="228" r="8" /><circle cx="20" cy="240" r="5" />
      </svg>
      <div className="hub-repeater__cloud-content">
        <p className="hub-repeater__eyebrow">{bubble.eyebrow}</p><h4>{bubble.title}</h4><p>{bubble.description}</p>
      </div>
    </aside>
  );
}

export function HubRepeaterDemo() {
  const [hasStarted, setHasStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const selectedDeviceId = stepIndex === hubScenario.steps.length - 1 ? "server" : undefined;

  return (
    <section aria-labelledby="hub-demo-title" className="network-basics-exercise hub-repeater" data-active-device={hasStarted ? bubbleByStep[stepIndex]?.deviceId : undefined} data-started={hasStarted ? "true" : "false"}>
      <h3 id="hub-demo-title">Watch a hub repeat one signal</h3>
      <p>Press Play, then follow the signal from the laptop to the hub and every connected host.</p>
      <PacketFlowPlayer
        allowMotionOverride autoplay={false} onPlaybackStart={() => setHasStarted(true)}
        onStepChange={(index) => setStepIndex(index)} packetMotion="dhcp-css"
        packetTravelDurationMs={PACKET_TRAVEL_DURATION_MS} scenario={hubScenario}
        selectedDeviceId={selectedDeviceId} showStepSummary={false} suppressHeading
        topologyOverlay={<HubTeachingBubble stepIndex={stepIndex} visible={hasStarted} />}
      />
    </section>
  );
}
