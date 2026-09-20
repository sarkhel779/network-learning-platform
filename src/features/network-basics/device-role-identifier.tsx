"use client";

import { useState } from "react";

const devices = [
  ["Laptop", "host"],
  ["Switch", "local connector"],
  ["Router", "network boundary"],
  ["Wireless access point", "wireless access"],
  ["Firewall", "security boundary"],
] as const;

export function DeviceRoleIdentifier() {
  const [answer, setAnswer] = useState<string>();
  return <section className="network-basics-exercise" aria-labelledby="device-role-title">
    <h3 id="device-role-title">Identify a device role</h3>
    <p>Hosts create or receive the information. Intermediary devices help connect, direct, or protect them.</p>
    <div className="network-basics-exercise__controls">
      {devices.map(([device, role]) => <button className="network-basics-exercise__control" key={device} type="button" onClick={() => setAnswer(`${device}: ${role}.`)}>{device}</button>)}
    </div>
    {answer ? <p className="network-basics-exercise__result" role="status">{answer}</p> : null}
  </section>;
}
