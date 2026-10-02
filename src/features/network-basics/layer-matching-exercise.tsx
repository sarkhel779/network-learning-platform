"use client";

import { useId, useState } from "react";

const examples = [
  { name: "DNS", role: "Looks up a name such as a website name.", layer: "application", explanation: "DNS is an Application-layer service. It provides a name-lookup service to applications." },
  { name: "TCP", role: "Provides transport between application processes.", layer: "transport", explanation: "TCP belongs to Transport in both models. It supports communication between application processes." },
  { name: "IP", role: "Supplies logical addressing for packets.", layer: "internet", explanation: "IP belongs to TCP/IP Internet, which maps to OSI Network (layer 3)." },
  { name: "Ethernet", role: "Carries frames and signals on a local link.", layer: "link", explanation: "Ethernet belongs to TCP/IP Network Access. Its framing and signaling span OSI Data Link and Physical." },
] as const;

export function LayerMatchingExercise() {
  const id = useId();
  const [exampleIndex, setExampleIndex] = useState(0);
  const [layer, setLayer] = useState("");
  const example = examples[exampleIndex];
  const correct = layer === example.layer;

  function changeExample(index: number) {
    setExampleIndex(index);
    setLayer("");
  }

  return (
    <section className="network-basics-exercise" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`}>Match a technology to a layer</h3>
      <p>Layered models divide networking work into smaller responsibilities. Match each example to its TCP/IP layer, then read how it relates to OSI.</p>
      <p>Example {exampleIndex + 1} of {examples.length}: <strong>{example.name}</strong> — {example.role}</p>
      <div className="network-basics-exercise__controls">
        <label htmlFor={`${id}-layer`}>{example.name} belongs to</label>
        <select className="network-basics-exercise__control" id={`${id}-layer`} value={layer} onChange={(event) => setLayer(event.target.value)}>
          <option value="">Choose a layer</option>
          <option value="link">Network Access</option>
          <option value="internet">Internet</option>
          <option value="transport">Transport</option>
          <option value="application">Application</option>
        </select>
      </div>
      {layer ? (
        <p className={`network-basics-exercise__result ${correct ? "is-correct" : "is-incorrect"}`} role="status">
          {correct ? "Correct" : "Not quite"} — {example.explanation}
        </p>
      ) : null}
      <div className="network-basics-exercise__controls">
        <button className="network-basics-exercise__control" type="button" disabled={exampleIndex === 0} onClick={() => changeExample(exampleIndex - 1)}>Previous example</button>
        <button className="network-basics-exercise__control" type="button" disabled={exampleIndex === examples.length - 1} onClick={() => changeExample(exampleIndex + 1)}>Next example</button>
        <button className="network-basics-exercise__control" type="button" onClick={() => changeExample(0)}>Restart matching</button>
      </div>
    </section>
  );
}
