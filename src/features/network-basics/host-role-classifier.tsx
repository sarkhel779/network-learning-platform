"use client";

import { useState } from "react";

const examples = [
  ["Phone opening a website", "client"],
  ["Web server answering a request", "server"],
  ["Laptop sharing a file while browsing", "both client and server"],
] as const;

export function HostRoleClassifier() {
  const [answer, setAnswer] = useState<string>();
  return <section className="network-basics-exercise" aria-labelledby="host-role-title">
    <h3 id="host-role-title">Classify the host role</h3>
    <p>Client and server roles describe what applications are doing, not a permanent type of machine.</p>
    <div className="network-basics-exercise__controls">
      {examples.map(([example, role]) => <button className="network-basics-exercise__control" key={example} type="button" onClick={() => setAnswer(`${example} acts as ${role}.`)}>{example}</button>)}
    </div>
    {answer ? <p className="network-basics-exercise__result" role="status">{answer}</p> : null}
  </section>;
}
