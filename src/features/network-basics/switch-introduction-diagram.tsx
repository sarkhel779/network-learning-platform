"use client";

import { useState } from "react";
import { NetworkDeviceSymbol } from "../packet-flow/network-device-symbol";

export function SwitchIntroductionDiagram() {
  const [destination, setDestination] = useState<"printer" | "server">("printer");
  const printer = destination === "printer";

  return (
    <figure className="switch-intro" aria-label="Selective delivery through a switch">
      <figcaption>One local network. A separate cable for each device.</figcaption>
      <div className="switch-intro__choices" role="group" aria-label="Choose a destination">
        <button type="button" aria-pressed={printer} onClick={() => setDestination("printer")}>Send to printer</button>
        <button type="button" aria-pressed={!printer} onClick={() => setDestination("server")}>Send to server</button>
      </div>
      <div className="switch-intro__viewport" role="region" aria-label="Switch cable diagram; scroll horizontally on small screens" tabIndex={0}>
        <svg viewBox="0 0 800 420" role="img" aria-label={`The laptop sends through port 1. The switch forwards to the ${destination} through port ${printer ? 3 : 4}. Other hosts receive no copy of this frame.`}>
          <g className="switch-intro__cable" data-switch-link="sender" data-active="true"><path d="M139 185 H296" /></g>
          <g className="switch-intro__cable" data-switch-link="workstation" data-active="false"><path d="M404 145 H480 V55 H641" /></g>
          <g className="switch-intro__cable" data-switch-link="printer" data-active={printer ? "true" : "false"}><path d="M404 185 H639" /></g>
          <g className="switch-intro__cable" data-switch-link="server" data-active={!printer ? "true" : "false"}><path d="M404 225 H480 V320 H645" /></g>
          <g className="switch-intro__body"><rect x="290" y="120" width="120" height="130" rx="8" /><rect x="290" y="175" width="16" height="20" rx="2" /><rect x="394" y="135" width="16" height="20" rx="2" /><rect x="394" y="175" width="16" height="20" rx="2" /><rect x="394" y="215" width="16" height="20" rx="2" /></g>
          <g className="switch-intro__ports"><text x="320" y="191">1</text><text x="372" y="151">2</text><text x="372" y="191">3</text><text x="372" y="231">4</text></g>
          <g className="switch-intro__arrows" aria-hidden="true"><path d="M220 176 L232 185 L220 194" /><path d={printer ? "M565 176 L577 185 L565 194" : "M565 311 L577 320 L565 329"} /></g>
          <NetworkDeviceSymbol kind="laptop" transform="translate(110 185)" />
          <NetworkDeviceSymbol kind="host" transform="translate(670 55)" />
          <NetworkDeviceSymbol kind="printer" transform="translate(670 185)" />
          <NetworkDeviceSymbol kind="server" transform="translate(670 320)" />
          <g className="switch-intro__labels" textAnchor="middle"><text x="110" y="237">Laptop</text><text x="350" y="100">Switch</text><text x="670" y="105">Workstation</text><text x="670" y="237">Printer</text><text x="670" y="369">Server</text></g>
          <g className="switch-intro__outcomes" textAnchor="middle"><text x="110" y="263">Sender · Port 1</text><text x="350" y="287">Selects the destination port</text><text x="670" y="129">Port 2 · No copy</text><text x="670" y="263">{printer ? "Port 3 · Receives this frame" : "Port 3 · No copy"}</text><text x="670" y="395">{printer ? "Port 4 · No copy" : "Port 4 · Receives this frame"}</text></g>
        </svg>
      </div>
      <p role="status" aria-live="polite">The laptop sends to the {destination}. The switch uses Port {printer ? 3 : 4}; the other hosts receive no copy of this frame.</p>
      <p className="switch-intro__note">Highlighted cables show this frame&apos;s path; grey cables are still connected. This example assumes the switch already knows the destination port. Unknown destinations and broadcasts behave differently—you will explore them in the Data Link Layer module. On small screens, swipe across the diagram.</p>
    </figure>
  );
}
