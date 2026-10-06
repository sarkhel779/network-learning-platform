export type AclRuleStatus = "matched-permit" | "matched-deny" | "not-matched" | "unreachable";
export type AclRuleRow = { rule: string; status: AclRuleStatus };

const statusLabel: Record<AclRuleStatus, string> = {
  "matched-permit": "Matched — permit",
  "matched-deny": "Matched — deny",
  "not-matched": "Not matched",
  unreachable: "Unreachable",
};

export function AclRuleListPanel({ rules, note }: { rules: AclRuleRow[]; note?: string }) {
  return (
    <div className="acl-rule-list">
      <h3>ACL rules, in evaluation order</h3>
      <ol>
        {rules.map((row) => (
          <li key={row.rule} data-status={row.status}>
            <code>{row.rule}</code>
            <span>{statusLabel[row.status]}</span>
          </li>
        ))}
      </ol>
      {note ? <p>{note}</p> : null}
    </div>
  );
}
