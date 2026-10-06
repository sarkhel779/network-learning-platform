"use client";

import { useId, useState } from "react";
import { NetworkDeviceSymbol } from "../packet-flow/network-device-symbol";

export function BridgeSegmentComparison() {
  const [view, setView] = useState("shared");
  const [traffic, setTraffic] = useState("local");
  const id = useId();
  const bridged = view === "bridged";
  const crosses = traffic === "cross";
  const rightReceives = !bridged || crosses;
  const result = !bridged
    ? `A sends to ${crosses ? "D" : "B"}: every other host receives a copy on this one shared segment, even though only the destination needs it.`
    : crosses
      ? "The bridge separates the two segments while still connecting them. A sends to D: the bridge forwards the frame to Segment B."
      : "The bridge separates the two segments while still connecting them. A sends to B: the frame stays on Segment A. The bridge filters it, so Segment B receives no copy.";

  return <section className="network-basics-exercise bridge-intro" aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`}>Compare local segments</h3>
    <p>A bridge joins two local segments and can keep some traffic on the segment where it belongs.</p>
    <fieldset>
      <legend>Choose a view</legend>
      <label><input checked={view === "shared"} name={`${id}-segment-view`} onChange={() => setView("shared")} type="radio" /> One shared segment</label>
      <label><input checked={view === "bridged"} name={`${id}-segment-view`} onChange={() => setView("bridged")} type="radio" /> Two connected segments</label>
    </fieldset>
    <fieldset>
      <legend>Choose who A sends to</legend>
      <label><input checked={traffic === "local"} name={`${id}-traffic`} onChange={() => setTraffic("local")} type="radio" /> A to B: same side</label>
      <label><input checked={traffic === "cross"} name={`${id}-traffic`} onChange={() => setTraffic("cross")} type="radio" /> A to D: other side</label>
    </fieldset>
    <div className="bridge-intro__scroll" role="region" aria-label="Connected segment diagram; scroll horizontally on small screens" tabIndex={0}>
      <svg viewBox="0 0 800 350" className="bridge-intro__diagram" role="img" aria-label={bridged ? `Two segments of one LAN: A sends to ${crosses ? "D across the bridge" : "B on Segment A"}` : "One shared segment: the hub repeats A's signal toward every other host"}>
        <g className="bridge-intro__boundaries">
          {bridged ? <><rect x="20" y="15" width="275" height="315" rx="12" /><rect x="505" y="15" width="275" height="315" rx="12" /></> : <rect x="20" y="15" width="760" height="315" rx="12" />}
        </g>
        <g className="bridge-intro__segment-labels" textAnchor="middle">
          {bridged ? <><text x="157" y="44">Segment A</text><text x="642" y="44">Segment B</text></> : <text x="400" y="44">One shared segment</text>}
        </g>
        <g className="bridge-intro__cables" data-active="true">
          <path d={bridged ? "M139 90 H220 V148 M139 250 H220 V192" : "M139 90 H300 V160 H366 M139 250 H300 V180 H366"} />
        </g>
        <g className="bridge-intro__cables" data-bridge-side="right" data-active={rightReceives ? "true" : "false"}>
          <path d={bridged ? "M661 90 H580 V148 M665 250 H580 V192" : "M661 90 H500 V160 H434 M665 250 H500 V180 H434"} />
        </g>
        {bridged ? <>
          <g className="bridge-intro__cables" data-active="true"><path d="M254 170 H361" /></g>
          <g className="bridge-intro__cables" data-bridge-transfer="true" data-active={crosses ? "true" : "false"}><path d="M439 170 H546" /></g>
          <NetworkDeviceSymbol kind="switch" transform="translate(220 170)" />
          <NetworkDeviceSymbol kind="switch" transform="translate(580 170)" />
          <g className="bridge-intro__bridge" data-bridge-device="true"><rect x="355" y="143" width="90" height="54" rx="5" /><rect x="355" y="164" width="12" height="12" /><rect x="433" y="164" width="12" height="12" /></g>
          <g className="bridge-intro__device-labels" textAnchor="middle"><text x="220" y="212">Hub</text><text x="580" y="212">Hub</text><text x="400" y="130">Bridge</text></g>
          <g className="bridge-intro__decision" textAnchor="middle"><text x="400" y="231">{crosses ? "Forward →" : "Do not forward"}</text><text x="400" y="254">{crosses ? "To Segment B" : "Same-side destination"}</text></g>
        </> : <><NetworkDeviceSymbol kind="switch" transform="translate(400 170)" /><text className="bridge-intro__device-labels" x="400" y="215" textAnchor="middle">Hub</text></>}
        <NetworkDeviceSymbol kind="host" transform="translate(110 90)" />
        <NetworkDeviceSymbol kind="host" transform="translate(110 250)" />
        <NetworkDeviceSymbol kind="host" transform="translate(690 90)" />
        <NetworkDeviceSymbol kind="server" transform="translate(690 250)" />
        <g className="bridge-intro__device-labels" textAnchor="middle"><text x="110" y="135">Host A</text><text x="110" y="295">Host B</text><text x="690" y="135">Host C</text><text x="690" y="295">Host D</text></g>
        <g className="bridge-intro__roles" textAnchor="middle"><text x="110" y="157">Sender</text><text x="110" y="317">{crosses ? "Copy ignored" : "Destination"}</text><text x="690" y="157">{rightReceives ? "Copy ignored" : "No copy received"}</text><text x="690" y="317">{crosses ? "Destination" : rightReceives ? "Copy ignored" : "No copy received"}</text></g>
      </svg>
    </div>
    <p className="bridge-intro__legend">Highlighted cables carry this transmission. Grey cables remain connected but carry no copy of this frame. On small screens, swipe across the diagram.</p>
    <p className="network-basics-exercise__result" role="status" aria-live="polite">{result}</p>
    <p className="bridge-intro__note">This example assumes the bridge already knows which side contains the destination. Both segments belong to one LAN; the bridge is not routing between IP networks. Unknown destinations and broadcast traffic are covered later.</p>
  </section>;
}
