import { useId } from "react";

import type { NatTableEntry } from "./nat-scenario.schema";

type TranslationTableInspectorProps = {
  entries: NatTableEntry[];
  activeEntryId?: string;
};

export function TranslationTableInspector({ entries, activeEntryId }: TranslationTableInspectorProps) {
  const headingId = useId();
  return (
    <section className="nat-table-inspector" aria-labelledby={headingId}>
      <h3 id={headingId}>Translation state</h3>
      {entries.length === 0 ? <p>No active translation exists yet.</p> : (
        <div className="nat-table-scroll" tabIndex={0}>
          <table>
            <caption>NAT translation table</caption>
            <thead>
              <tr>
                <th scope="col">Mapping</th>
                <th scope="col">Protocol</th>
                <th scope="col">Inside local</th>
                <th scope="col">Inside global</th>
                <th scope="col">Outside global</th>
                <th scope="col">State</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} data-active={entry.id === activeEntryId ? "true" : undefined}>
                  <th scope="row">{entry.id}</th>
                  <td>{entry.protocol.toUpperCase()}</td>
                  <td>{entry.insideLocal}</td>
                  <td>{entry.insideGlobal}</td>
                  <td>{entry.outsideGlobal}</td>
                  <td>{entry.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
