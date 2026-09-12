import type { ReactNode } from "react";

type WiresharkCheckProps = {
  filter?: string;
  displayFilter?: string;
  fields?: string[];
  normalEvidence?: string;
  exercise?: string;
  children?: ReactNode;
  downloadHref?: string;
};

export function WiresharkCheck({
  filter,
  displayFilter,
  fields,
  normalEvidence,
  exercise,
  children,
  downloadHref,
}: WiresharkCheckProps) {
  return (
    <section aria-label="Basic Wireshark check" className="learning-block wireshark-check">
      <h2>Basic Wireshark check</h2>
      <p><strong>Display filter:</strong> <code>{filter ?? displayFilter}</code></p>
      {fields?.length ? <><h3>Fields to inspect</h3><ul>{fields.map((field) => <li key={field}><code>{field}</code></li>)}</ul></> : null}
      {normalEvidence ? <p><strong>Normal evidence:</strong> {normalEvidence}</p> : null}
      {exercise ? <p><strong>Try it:</strong> {exercise}</p> : null}
      {children ? <p>{children}</p> : null}
      {downloadHref ? <p><a href={downloadHref}>Download the practice capture</a></p> : null}
    </section>
  );
}
