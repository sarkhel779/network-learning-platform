"use client";

import { useState } from "react";

export function LayerMatchingExercise() {
  const [layer, setLayer] = useState("");
  return <section className="network-basics-exercise" aria-labelledby="layer-title">
    <h3 id="layer-title">Match a technology to a layer</h3>
    <p>Layered models divide networking work into smaller responsibilities. DNS belongs to the application layer.</p>
    <label htmlFor="dns-layer">DNS belongs to</label>
    <select className="network-basics-exercise__control" id="dns-layer" value={layer} onChange={(event) => setLayer(event.target.value)}>
      <option value="">Choose a layer</option><option value="link">Link</option><option value="internet">Internet</option><option value="transport">Transport</option><option value="application">Application</option>
    </select>
    {layer ? <p className={`network-basics-exercise__result ${layer === "application" ? "is-correct" : "is-incorrect"}`} role="status">{layer === "application" ? "Correct — DNS is an application-layer service." : "Not quite — try the layer closest to user applications."}</p> : null}
  </section>;
}
