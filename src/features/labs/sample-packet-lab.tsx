"use client";

import { useEffect, useId, useState } from "react";

import { buildLabJourney, type LabConfiguration, type LabDevice } from "./sample-lab-scenarios";

type LabView = "Lab Topology" | "Packet Flow" | "Config" | "Explanation";
const views: LabView[] = ["Lab Topology", "Packet Flow", "Config", "Explanation"];
const deviceNames: Record<LabDevice, string> = { pc: "Your PC", switch: "Switch", router: "Gateway router", server: "Destination server" };

function DeviceIcon({ device }: { device: LabDevice }) {
  if (device === "pc") return <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="8" width="32" height="25" rx="2" /><path d="M4 38h40l-3 4H7z" /></svg>;
  if (device === "switch") return <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="16" width="38" height="18" rx="3" /><path d="M10 29h28" /><circle cx="13" cy="23" r="1" /><circle cx="22" cy="23" r="1" /><circle cx="31" cy="23" r="1" /></svg>;
  if (device === "router") return <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="19" width="34" height="17" rx="3" /><path d="M14 19V7m20 12V7M12 30h24" /><circle cx="16" cy="25" r="1" /><circle cx="25" cy="25" r="1" /></svg>;
  return <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="12" y="5" width="24" height="11" rx="2" /><rect x="12" y="19" width="24" height="11" rx="2" /><rect x="12" y="33" width="24" height="11" rx="2" /><path d="M17 10h11m-11 14h11m-11 14h11" /></svg>;
}

export function SamplePacketLab() {
  const [configuration, setConfiguration] = useState<LabConfiguration>("remote");
  const [view, setView] = useState<LabView>("Lab Topology");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const id = useId();
  const journey = buildLabJourney(configuration);
  const step = journey[index];
  const devices: LabDevice[] = configuration === "local" ? ["pc", "switch", "server"] : ["pc", "switch", "router", "server"];
  const activeStart = devices.indexOf(step.from);
  const activeEnd = step.to ? devices.indexOf(step.to) : -1;

  useEffect(() => {
    if (!playing || index >= journey.length - 1) return;
    const timer = window.setTimeout(() => setIndex((current) => current + 1), 1650);
    return () => window.clearTimeout(timer);
  }, [index, journey.length, playing]);

  function chooseConfiguration(value: LabConfiguration) {
    setConfiguration(value);
    setIndex(0);
    setPlaying(false);
    setChecked(false);
    setPrediction(null);
  }

  function selectView(next: LabView) { setView(next); }

  return <section aria-label="Sample packet experiment" className="sample-lab">
    <div className="sample-lab__tabs" role="tablist" aria-label="Lab views">
      {views.map((name, tabIndex) => <button key={name} role="tab" type="button" aria-selected={view === name} aria-controls={`${id}-panel`} tabIndex={view === name ? 0 : -1} onClick={() => selectView(name)} onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const next = views[(tabIndex + (event.key === "ArrowRight" ? 1 : views.length - 1)) % views.length];
        selectView(next);
        event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[views.indexOf(next)]?.focus();
      }}>{name}</button>)}
    </div>
    <div className="sample-lab__panel" id={`${id}-panel`} role="tabpanel" aria-label={view}>
      {view === "Lab Topology" ? <div className="sample-lab__topology" role="img" aria-label={`Packet path from your PC to ${configuration === "local" ? "a local server" : "a remote server"}`}>
        {devices.map((device, deviceIndex) => <div className="sample-lab__segment" key={device}>
          <div className={`sample-lab__device ${device === step.from || device === step.to ? "sample-lab__device--active" : ""}`}><DeviceIcon device={device} /><strong>{deviceNames[device]}</strong>{device === "pc" ? <small>192.0.2.10</small> : device === "server" ? <small>{configuration === "local" ? "192.0.2.20" : "198.51.100.20"}</small> : null}</div>
          {deviceIndex < devices.length - 1 ? <div className={`sample-lab__link ${Math.min(activeStart, activeEnd) === deviceIndex && Math.abs(activeStart - activeEnd) === 1 ? "sample-lab__link--active" : ""}`}>
            {Math.min(activeStart, activeEnd) === deviceIndex && Math.abs(activeStart - activeEnd) === 1 ? <span key={`${configuration}-${index}`} data-testid="moving-lab-packet" className={`sample-lab__packet ${activeStart > activeEnd ? "sample-lab__packet--reverse" : ""}`} aria-hidden="true">▣</span> : null}
          </div> : null}
        </div>)}
      </div> : null}
      {view === "Packet Flow" ? <div className="sample-lab__flow"><h3>{step.packetKind}</h3><p>{step.explanation}</p><dl><div><dt>Source IP</dt><dd>{step.sourceIp}</dd></div><div><dt>Destination IP</dt><dd>{step.destinationIp}</dd></div><div><dt>Source MAC</dt><dd>{step.sourceMac}</dd></div><div><dt>Destination MAC</dt><dd>{step.destinationMac}</dd></div></dl></div> : null}
      {view === "Config" ? <fieldset className="sample-lab__config"><legend>Choose a destination and gateway setup</legend><label><input type="radio" name={`${id}-configuration`} checked={configuration === "local"} onChange={() => chooseConfiguration("local")} />Local server · 192.0.2.20</label><label><input type="radio" name={`${id}-configuration`} checked={configuration === "remote"} onChange={() => chooseConfiguration("remote")} />Remote server · gateway available</label><label><input type="radio" name={`${id}-configuration`} checked={configuration === "no-gateway"} onChange={() => chooseConfiguration("no-gateway")} />No default gateway · remote server</label><p>The example assumes needed MAC addresses are already known; it focuses on forwarding decisions.</p></fieldset> : null}
      {view === "Explanation" ? <div className="sample-lab__explanation"><h3>What changed at this hop?</h3><p>{step.explanation}</p><p>{configuration === "local" ? "A local destination stays on the LAN." : configuration === "remote" ? "A router changes the Ethernet frame at the network boundary while the IP conversation keeps its endpoints." : "A missing gateway is a local configuration problem, not a packet lost in transit."}</p></div> : null}
    </div>
    <p className="sample-lab__stage" role="status">Hop {index + 1} of {journey.length}: {step.title}{step.outcome === "blocked" ? " · blocked" : step.outcome === "delivered" ? " · delivered" : ""}</p>
    <div className="sample-lab__controls"><button type="button" onClick={() => setPlaying((value) => !value)} disabled={index >= journey.length - 1}>{playing ? "Pause" : "Play packet flow"}</button><button type="button" onClick={() => { setPlaying(false); setIndex((current) => Math.min(current + 1, journey.length - 1)); }} disabled={index >= journey.length - 1}>Next hop</button><button type="button" onClick={() => { setPlaying(false); setIndex(0); }}>Restart</button></div>
    <fieldset className="sample-lab__quiz"><legend>Predict: for a remote destination, which device’s MAC is the destination of the PC’s first Ethernet frame?</legend><label><input type="radio" name={`${id}-prediction`} checked={prediction === "server"} onChange={() => { setPrediction("server"); setChecked(false); }} />The remote server directly</label><label><input type="radio" name={`${id}-prediction`} checked={prediction === "router"} onChange={() => { setPrediction("router"); setChecked(false); }} />The router (default gateway)</label><label><input type="radio" name={`${id}-prediction`} checked={prediction === "switch"} onChange={() => { setPrediction("switch"); setChecked(false); }} />The DNS resolver</label><button type="button" disabled={!prediction} onClick={() => setChecked(true)}>Check prediction</button>{checked ? <p role="status" aria-label="Prediction feedback">{prediction === "router" ? "Correct. The PC sends to its default gateway’s MAC; the switch forwards that frame." : "Not quite. The PC sends the frame toward its default gateway, while the IP destination stays the remote server."}</p> : null}</fieldset>
  </section>;
}
