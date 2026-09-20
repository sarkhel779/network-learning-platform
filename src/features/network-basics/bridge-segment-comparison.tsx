"use client";

import { useState } from "react";

export function BridgeSegmentComparison() {
  const [view, setView] = useState("shared");
  return <section className="network-basics-exercise" aria-labelledby="bridge-title">
    <h3 id="bridge-title">Compare local segments</h3>
    <p>A bridge joins two local segments and can keep some traffic on the segment where it belongs.</p>
    <fieldset>
      <legend>Choose a view</legend>
      <label><input checked={view === "shared"} name="segment-view" onChange={() => setView("shared")} type="radio" /> One shared segment</label>
      <label><input checked={view === "bridged"} name="segment-view" onChange={() => setView("bridged")} type="radio" /> Two connected segments</label>
    </fieldset>
    <p className="network-basics-exercise__result" role="status">{view === "shared" ? "Every device shares one segment." : "The bridge separates the two segments while still connecting them."}</p>
  </section>;
}
