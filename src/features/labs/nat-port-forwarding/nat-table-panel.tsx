export type NatTableRow = { private: string; public: string; note?: string };

export function NatTablePanel({ rows, caption }: { rows: NatTableRow[]; caption?: string }) {
  return (
    <div className="nat-table">
      <h3>NAT translation table</h3>
      {caption ? <p>{caption}</p> : null}
      <table>
        <thead>
          <tr><th>Private address</th><th>Public address</th><th>Note</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.private}>
              <td>{row.private}</td>
              <td>{row.public}</td>
              <td>{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
