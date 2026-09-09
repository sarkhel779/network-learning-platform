"use client";

import { useState } from "react";

import type { PacketFlowStep } from "./packet-flow.schema";

type PacketInspectorProps = Readonly<{ step: PacketFlowStep; allowDepthSelection?: boolean }>;

function Fields({ fields }: Readonly<{ fields: PacketFlowStep["summaryFields"] }>) {
  return (
    <dl>
      {fields.map((field) => (
        <div key={field.label} data-changed={field.changed ? "true" : undefined}>
          <dt>{field.label}</dt>
          <dd>{field.value}{field.changed ? <span>Changed at this hop</span> : null}</dd>
        </div>
      ))}
    </dl>
  );
}

function PacketLayers({ step }: { step: PacketFlowStep }) {
  const evidence = [step.packet?.label, step.title, ...step.summaryFields.map(({ value }) => value)].join(" ").toUpperCase();
  if (evidence.includes("ARP")) {
    return <section data-packet-layer="ethernet"><h4>Ethernet frame</h4><section data-packet-layer="arp"><h4>ARP message</h4></section></section>;
  }
  if (evidence.includes("ICMP") || evidence.includes("ECHO")) {
    return <section data-packet-layer="ethernet"><h4>Ethernet frame</h4><section data-packet-layer="ip"><h4>IP packet</h4><section data-packet-layer="icmp"><h4>ICMP message</h4></section></section></section>;
  }
  if (step.packet) {
    return <section data-packet-layer="ethernet"><h4>Ethernet frame</h4><section data-packet-layer="ip"><h4>IP packet</h4></section></section>;
  }
  return <section data-packet-layer="context"><h4>Host or device decision</h4><p>No frame is crossing a link during this step.</p></section>;
}

export function PacketInspector({ step, allowDepthSelection = false }: PacketInspectorProps) {
  const [depth, setDepth] = useState<"plain" | "technical">("plain");
  return (
    <section className="packet-inspector">
      <h3>Packet inspector</h3>
      <h4>Inside the packet</h4>
      {allowDepthSelection ? <fieldset className="packet-inspector__depth">
        <legend>Choose packet inspection depth</legend>
        <label><input checked={depth === "plain"} name="packet-inspection-depth" onChange={() => setDepth("plain")} type="radio" />Plain-language view</label>
        <label><input checked={depth === "technical"} name="packet-inspection-depth" onChange={() => setDepth("technical")} type="radio" />Technical inspection</label>
      </fieldset> : null}
      <div className="packet-inspector__layers" aria-label="Packet layers at this hop"><PacketLayers step={step} /></div>
      <section aria-label="Plain-language packet fields"><Fields fields={step.summaryFields} /></section>
      {step.detailFields.length ? (
        <details open={depth === "technical" || undefined}>
          <summary>Technical packet details</summary>
          {depth === "technical" ? <h4>Technical packet fields</h4> : null}
          <Fields fields={step.detailFields} />
        </details>
      ) : null}
    </section>
  );
}
