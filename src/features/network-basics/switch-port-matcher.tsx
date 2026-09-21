"use client";

import { useState } from "react";

export function SwitchPortMatcher() {
  const [port, setPort] = useState("");
  return <section className="network-basics-exercise" aria-labelledby="switch-title">
    <h3 id="switch-title">Match a host to a switch port</h3>
    <p>Switch ports connect local devices. In this example, the printer cable is plugged into Port 3.</p>
    <label htmlFor="printer-port">Printer connects to</label>
    <select className="network-basics-exercise__control" id="printer-port" value={port} onChange={(event) => setPort(event.target.value)}>
      <option value="">Choose a port</option><option value="port-1">Port 1</option><option value="port-2">Port 2</option><option value="port-3">Port 3</option>
    </select>
    {port ? <p className={`network-basics-exercise__result ${port === "port-3" ? "is-correct" : "is-incorrect"}`} role="status">{port === "port-3" ? "Correct — the printer is connected to Port 3." : "Try again — follow the printer cable."}</p> : null}
  </section>;
}
