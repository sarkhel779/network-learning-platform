"use client";

import { useState } from "react";

const samples = {
  "02:1A:2B:3C:4D:5E": "MAC address — the U/L bit shows that it is locally administered; the I/G bit shows an individual address.",
  "01:00:5E:00:00:FB": "MAC address — the I/G bit shows a group (multicast) address.",
  "192.0.2.10": "IPv4 address — a logical address written in dotted decimal.",
} as const;

export function AddressFormatInspector() {
  const [answer, setAnswer] = useState<string>();
  return <section className="network-basics-exercise" aria-labelledby="address-title">
    <h3 id="address-title">Inspect an address format</h3>
    <p>MAC and IP addresses have different jobs and recognizable written formats.</p>
    <div className="network-basics-exercise__controls">
      {Object.entries(samples).map(([sample, explanation]) => <button className="network-basics-exercise__control network-basics-exercise__code" key={sample} type="button" onClick={() => setAnswer(explanation)}>{sample}</button>)}
    </div>
    {answer ? <p className="network-basics-exercise__result" role="status">{answer}</p> : null}
  </section>;
}
