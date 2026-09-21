"use client";

import { useState } from "react";

export function RouterBoundaryPlacement() {
  const [result, setResult] = useState<string>();
  return <section className="network-basics-exercise" aria-labelledby="router-title">
    <h3 id="router-title">Place the router</h3>
    <p>Routers connect different IP networks. A host can use a router interface as its default gateway.</p>
    <div className="network-basics-exercise__controls">
      <button className="network-basics-exercise__control" type="button" onClick={() => setResult("Correct boundary — the router joins the Office LAN to the Internet.")}>Between Office LAN and Internet</button>
      <button className="network-basics-exercise__control" type="button" onClick={() => setResult("That position is inside one network. Choose the boundary between different networks.")}>Between two Office LAN hosts</button>
    </div>
    {result ? <p className="network-basics-exercise__result" role="status">{result}</p> : null}
  </section>;
}
