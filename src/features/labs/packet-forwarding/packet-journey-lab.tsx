"use client";

import { useId, useState } from "react";

import { HostIcon, RouterIcon, ServerIcon, SwitchIcon } from "../hop-icons";
import { NetworkCanvas, type CanvasLink, type CanvasNode } from "../network-canvas";
import { PacketEnvelope } from "../packet-envelope";
import { buildLabJourney, layersForHop, quizFor, type LabConfiguration, type LabDevice } from "./packet-journey-scenarios";

const deviceNames: Record<LabDevice, string> = { pc: "Your PC", switch: "Switch", router: "Gateway router", server: "Destination server" };

function iconFor(device: LabDevice) {
  if (device === "pc") return <HostIcon />;
  if (device === "switch") return <SwitchIcon />;
  if (device === "router") return <RouterIcon />;
  return <ServerIcon />;
}

export function PacketJourneyLab({ configuration }: { configuration: LabConfiguration }) {
  const id = useId();
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const journey = buildLabJourney(configuration);
  const step = journey[index];
  const previousStep = index > 0 ? journey[index - 1] : null;
  const quiz = quizFor(configuration);

  const devices: LabDevice[] = configuration === "local" ? ["pc", "switch", "server"] : ["pc", "switch", "router", "server"];
  const xPositions = devices.length === 3 ? [15, 50, 85] : [15, 38, 61, 85];
  const packetAt = step.to ?? step.from;
  const blockedAt = step.outcome === "blocked" ? step.from : null;
  const destinationIp = configuration === "local" ? "192.0.2.20" : "198.51.100.20";

  const nodes: CanvasNode[] = devices.map((device, deviceIndex) => ({
    id: device,
    x: xPositions[deviceIndex],
    y: 50,
    label: deviceNames[device],
    sublabel: device === "pc" ? "192.0.2.10" : device === "server" ? destinationIp : undefined,
    icon: iconFor(device),
    state: blockedAt === device ? "blocked" : packetAt === device ? "active" : "idle",
  }));
  const links: CanvasLink[] = devices.slice(0, -1).map((device, deviceIndex) => ({ from: device, to: devices[deviceIndex + 1] }));
  const layers = layersForHop(step, previousStep);

  function sendNextHop() {
    setIndex((current) => Math.min(current + 1, journey.length - 1));
  }
  function restart() {
    setIndex(0);
    setPrediction(null);
    setChecked(false);
  }

  return (
    <section aria-label="Packet forwarding experiment" className="sample-lab">
      <div className="sample-lab__panel acl-sim">
        <NetworkCanvas
          ariaLabel={`Packet path from your PC to ${configuration === "local" ? "a local server" : "a remote server"}`}
          nodes={nodes}
          links={links}
          packetAt={packetAt}
        />
        <div className="packet-envelope-wrap">
          <h3>{step.title}</h3>
          <p>Unfold each layer below to inspect what this hop&apos;s packet actually carries.</p>
          <PacketEnvelope ariaLabel={`Packet contents at hop ${index + 1}`} layers={layers} />
          <p className="packet-envelope-wrap__explanation">{step.explanation}</p>
        </div>
      </div>
      <p className="sample-lab__stage" role="status">
        Hop {index + 1} of {journey.length}: {step.title}
        {step.outcome === "blocked" ? " · blocked" : step.outcome === "delivered" ? " · delivered" : ""}
      </p>
      <div className="sample-lab__controls">
        <button type="button" onClick={sendNextHop} disabled={index >= journey.length - 1}>Send to next hop</button>
        <button type="button" onClick={restart}>Restart</button>
      </div>
      <fieldset className="sample-lab__quiz">
        <legend>{quiz.question}</legend>
        {quiz.options.map((option) => (
          <label key={option.id}>
            <input
              type="radio"
              name={`${id}-prediction`}
              checked={prediction === option.id}
              onChange={() => { setPrediction(option.id); setChecked(false); }}
            />
            {option.label}
          </label>
        ))}
        <button type="button" disabled={!prediction} onClick={() => setChecked(true)}>Check prediction</button>
        {checked ? (
          <p role="status" aria-label="Prediction feedback">
            {prediction === quiz.correctId ? quiz.feedbackCorrect : quiz.feedbackIncorrect}
          </p>
        ) : null}
      </fieldset>
    </section>
  );
}
