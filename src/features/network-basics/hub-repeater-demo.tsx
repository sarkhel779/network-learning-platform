"use client";

import { useState } from "react";

export function HubRepeaterDemo() {
  const [sent, setSent] = useState(false);
  return <section className="network-basics-exercise" aria-labelledby="hub-demo-title">
    <h3 id="hub-demo-title">Watch a hub repeat a signal</h3>
    <p>A hub does not choose a destination. It repeats an incoming signal to every other active port.</p>
    <div className="network-basics-exercise__port-row" aria-label="Four-port hub">
      {[1, 2, 3, 4].map((port) => <span className={sent && port > 1 ? "is-selected" : ""} key={port}>Port {port}</span>)}
    </div>
    <button className="network-basics-exercise__control" type="button" onClick={() => setSent(true)}>Send signal into port 1</button>
    {sent ? <p className="network-basics-exercise__result" role="status">The signal is repeated to ports 2, 3, and 4.</p> : null}
  </section>;
}
