import type { NatTranslation, NatTuple } from "./nat-scenario.schema";

type PacketTupleInspectorProps = {
  tuple: NatTuple;
  translations: NatTranslation[];
  expectedTuple?: NatTuple;
};

function endpoint(ip: string, port?: number): string {
  return port === undefined ? ip : `${ip}:${port}`;
}

const fieldLabels: Record<NatTranslation["field"], string> = {
  sourceIp: "Source IP",
  sourcePort: "Source port",
  destinationIp: "Destination IP",
  destinationPort: "Destination port",
};

export function PacketTupleInspector({ tuple, translations, expectedTuple }: PacketTupleInspectorProps) {
  const mismatches = expectedTuple
    ? (["sourceIp", "sourcePort", "destinationIp", "destinationPort"] as const)
        .filter((field) => tuple[field] !== expectedTuple[field])
        .map((field) => `${fieldLabels[field]} mismatch`)
    : [];

  return (
    <section className="nat-tuple-inspector" aria-labelledby="nat-tuple-heading">
      <h3 id="nat-tuple-heading">Packet tuple</h3>
      <dl>
        <div><dt>Protocol</dt><dd>{tuple.protocol.toUpperCase()}</dd></div>
        <div><dt>Source</dt><dd>{endpoint(tuple.sourceIp, tuple.sourcePort)}</dd></div>
        <div><dt>Destination</dt><dd>{endpoint(tuple.destinationIp, tuple.destinationPort)}</dd></div>
      </dl>
      {translations.length > 0 ? (
        <div className="nat-translation-evidence" aria-label="Translations applied">
          {translations.map((translation, index) => (
            <p key={`${translation.kind}-${translation.field}-${index}`}>
              <strong>{translation.kind.toUpperCase()} · {fieldLabels[translation.field]}:</strong>{" "}
              <span>{translation.before}</span>{" → "}
              <mark data-translated="true">{translation.after}</mark>
            </p>
          ))}
        </div>
      ) : <p>No fields changed at this step.</p>}
      {mismatches.length > 0 ? <p role="status">{mismatches.join("; ")}.</p> : null}
    </section>
  );
}
