import type { PacketFlowStep } from "./packet-flow.schema";

type PacketInspectorProps = Readonly<{ step: PacketFlowStep }>;

function Fields({ fields }: Readonly<{ fields: PacketFlowStep["summaryFields"] }>) {
  return (
    <dl>
      {fields.map((field) => (
        <div key={field.label} data-changed={field.changed ? "true" : undefined}>
          <dt>{field.label}</dt>
          <dd>
            {field.value}
            {field.changed ? <span>Changed at this hop</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function PacketInspector({ step }: PacketInspectorProps) {
  return (
    <section className="packet-inspector">
      <h3>Packet inspector</h3>
      <Fields fields={step.summaryFields} />
      {step.detailFields.length ? (
        <details>
          <summary>Technical packet details</summary>
          <Fields fields={step.detailFields} />
        </details>
      ) : null}
    </section>
  );
}
