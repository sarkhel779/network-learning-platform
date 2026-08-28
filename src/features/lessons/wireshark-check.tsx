type WiresharkCheckProps = {
  filter: string;
  fields: string[];
  normalEvidence: string;
  exercise: string;
  downloadHref?: string;
};

export function WiresharkCheck({
  filter,
  fields,
  normalEvidence,
  exercise,
  downloadHref,
}: WiresharkCheckProps) {
  return (
    <section aria-label="Basic Wireshark check" className="learning-block wireshark-check">
      <h2>Basic Wireshark check</h2>
      <p><strong>Display filter:</strong> <code>{filter}</code></p>
      <h3>Fields to inspect</h3>
      <ul>
        {fields.map((field) => <li key={field}><code>{field}</code></li>)}
      </ul>
      <p><strong>Normal evidence:</strong> {normalEvidence}</p>
      <p><strong>Try it:</strong> {exercise}</p>
      {downloadHref ? <p><a href={downloadHref}>Download the practice capture</a></p> : null}
    </section>
  );
}
