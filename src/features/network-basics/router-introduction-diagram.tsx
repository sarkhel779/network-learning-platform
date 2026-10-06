"use client";

import { useState } from "react";
import { NetworkDeviceSymbol } from "../packet-flow/network-device-symbol";

export function RouterIntroductionDiagram() {
  const [remote, setRemote] = useState(false);
  return (
    <figure id="router-delivery-example" className="router-intro" aria-label="Local delivery or delivery to another network">
      <figcaption>Does this message need to leave the Office LAN?</figcaption>
      <div className="router-intro__choices" role="group" aria-label="Choose a destination">
        <button type="button" aria-pressed={!remote} onClick={() => setRemote(false)}>Send to office printer</button>
        <button type="button" aria-pressed={remote} onClick={() => setRemote(true)}>Send to another network</button>
      </div>
      <div className="router-intro__viewport" role="region" aria-label="Router network boundary diagram; scroll horizontally on small screens" tabIndex={0}>
        <svg viewBox="0 0 800 390" role="img" aria-label={remote ? "Laptop to office switch to router's LAN interface, then through its other interface to a server on another network." : "Laptop to switch to office printer. The router and other network are not on this delivery path."}>
          <g className="router-intro__boundaries"><rect x="15" y="40" width="455" height="325" rx="12" /><rect x="470" y="40" width="315" height="325" rx="12" /></g>
          <g className="router-intro__labels" textAnchor="middle"><text x="222" y="25">Office LAN</text><text x="667" y="25">Another IP network</text></g>
          <g className="router-intro__cable" data-router-link="sender" data-active="true"><path d="M139 105 H205 V175 H236" /></g>
          <g className="router-intro__cable" data-router-link="printer" data-active={!remote ? "true" : "false"}><path d="M141 270 H205 V195 H236" /></g>
          <g className="router-intro__cable" data-router-link="gateway" data-active={remote ? "true" : "false"}><path d="M304 185 H442" /></g>
          <g className="router-intro__cable" data-router-link="remote" data-active={remote ? "true" : "false"}><path d="M498 185 H665" /></g>
          <g className="router-intro__arrows" aria-hidden="true"><path d="M165 96 L177 105 L165 114" /><path d={remote ? "M355 176 L367 185 L355 194 M605 176 L617 185 L605 194" : "M177 261 L165 270 L177 279"} /></g>
          <NetworkDeviceSymbol kind="laptop" transform="translate(110 105)" />
          <NetworkDeviceSymbol kind="printer" transform="translate(110 270)" />
          <NetworkDeviceSymbol kind="switch" transform="translate(270 185)" />
          <NetworkDeviceSymbol kind="router" transform="translate(470 185)" />
          <NetworkDeviceSymbol kind="server" transform="translate(690 185)" />
          <g className="router-intro__labels" textAnchor="middle"><text x="110" y="153">Laptop</text><text x="110" y="321">Printer</text><text x="270" y="232">Switch</text><text x="470" y="242">Router</text><text x="690" y="237">Server</text></g>
          <g className="router-intro__notes" textAnchor="middle"><text x="110" y="176">Sender</text><text x="110" y="345">{remote ? "No copy" : "Local destination"}</text><text x="690" y="260">{remote ? "Remote destination" : "No copy"}</text></g>
          <g className="router-intro__interfaces"><circle cx="442" cy="185" r="5" /><circle cx="498" cy="185" r="5" /><path d="M442 180 V118 H375 M498 180 V100 H580" /></g>
          <g className="router-intro__notes" textAnchor="middle"><text x="355" y="90">LAN interface</text><text x="355" y="111" className="router-intro__gateway">Default gateway</text><text x="602" y="73">Other interface</text><text x="602" y="94">Faces the other network</text></g>
        </svg>
      </div>
      <p role="status" aria-live="polite">{remote ? "The laptop sends to its default gateway—the router's LAN interface. The router forwards toward the server on the other network." : "The laptop sends to the printer through the switch. This delivery stays inside the Office LAN; it does not pass through the router."}</p>
      <p className="router-intro__note">Highlighted cables show this message&apos;s path; grey cables remain connected. The gateway is the router&apos;s local interface, not the final destination. This simplified example joins two IP networks directly; reaching the Internet can involve more routers. Detailed addressing and path decisions come later. On small screens, swipe across the diagram.</p>
    </figure>
  );
}
