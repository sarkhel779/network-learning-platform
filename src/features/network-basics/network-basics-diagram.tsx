"use client";

import { useState } from "react";
import { NetworkDeviceSymbol, type NetworkDeviceSymbolKind } from "../packet-flow/network-device-symbol";

const devices = [
  { name: "Laptop", kind: "laptop", role: "End device", explanation: "The laptop creates the print job. It is an end device: the information starts here." },
  { name: "Switch", kind: "switch", role: "Intermediary device", explanation: "The switch connects devices within this local network. It helps the information reach the printer." },
  { name: "Printer", kind: "printer", role: "End device", explanation: "The printer receives the print job and prints it. It is an end device: the information is used here." },
] as const;

function Symbol({ kind }: { kind: NetworkDeviceSymbolKind }) {
  return <svg viewBox="0 0 80 80" aria-hidden="true"><NetworkDeviceSymbol kind={kind} transform="translate(40 40)" /></svg>;
}

export function NetworkBasicsDiagram({ variant }: { variant: "local" | "scope" | "roles" }) {
  const [explanation, setExplanation] = useState("Select a device to see its basic role.");
  const [connected, setConnected] = useState(true);
  const [filter, setFilter] = useState("all");
  const titles = { local: "A small local network", scope: "Local network ≠ Internet", roles: "Where information starts, travels and ends" };
  return <figure className="network-intro-diagram" aria-label={titles[variant]}>
    <figcaption>{titles[variant]}</figcaption>
    {variant === "roles" && <div className="network-intro-diagram__controls">
      {[["end", "Show end devices"], ["intermediary", "Show intermediary devices"], ["all", "Show all devices"]].map(([value, label]) =>
        <button key={value} type="button" aria-pressed={filter === value} onClick={() => {
          setFilter(value);
          setExplanation(value === "end" ? "Laptop and printer are end devices: one creates information and the other receives it." : value === "intermediary" ? "The switch connects the end devices. It is the intermediary, not the source or destination of the print job." : "End devices and intermediary devices work together to make this network useful.");
        }}>{label}</button>)}
    </div>}
    <div className="network-intro-diagram__lan">
      <span className="network-intro-diagram__label">One home or office LAN</span>
      <div className="network-intro-diagram__devices">
        {devices.map(device => <button key={device.name} type="button" aria-label={`Explain ${device.name}`} className="network-intro-diagram__device" data-highlighted={filter === "all" || (filter === "end" ? device.role === "End device" : device.role === "Intermediary device")} onClick={() => setExplanation(device.explanation)}>
          <Symbol kind={device.kind} /><strong>{device.name}</strong><span>{variant === "roles" ? device.role : device.name === "Laptop" ? "Creates a print job" : device.name === "Switch" ? "Connects the devices" : "Receives the print job"}</span>
        </button>)}
      </div>
      {variant === "scope" && <div className="network-intro-diagram__gateway"><span className="network-intro-diagram__wire" /><Symbol kind="router" /><strong>Router</strong><span>Connects this LAN to other networks</span></div>}
    </div>
    {variant === "scope" && <>
      <div className="network-intro-diagram__internet" data-connected={connected}>
        <span className="network-intro-diagram__wire" /><span>{connected ? "Internet connected" : "Internet disconnected"}</span><Symbol kind="provider" /><strong>Internet</strong><span>Many interconnected networks</span>
      </div>
      <div className="network-intro-diagram__controls"><button type="button" onClick={() => {
        setConnected(!connected);
        setExplanation(connected ? "Local printing still works: laptop → switch → printer. Opening a website on the Internet needs the Internet connection." : "Internet access is restored. The local printing connections have not changed.");
      }}>{connected ? "Disconnect Internet" : "Reconnect Internet"}</button><span>Try it here — this is only a simulation.</span></div>
    </>}
    <p role="status" className="network-intro-diagram__explanation">{explanation}</p>
    {variant === "scope" && <p className="network-intro-diagram__note">This example uses an already configured local network printer, not a cloud printing service.</p>}
  </figure>;
}

export function NetworkBenefits() {
  return <div className="network-intro-benefits">{[
    { kind: "laptop" as const, title: "Communicate", text: "Send a message or share a file." },
    { kind: "printer" as const, title: "Share devices", text: "Several people can use one network printer." },
    { kind: "server" as const, title: "Access services", text: "Open a website or use an online learning platform." },
  ].map(item => <div key={item.title}><Symbol kind={item.kind} /><strong>{item.title}</strong><p>{item.text}</p></div>)}</div>;
}
