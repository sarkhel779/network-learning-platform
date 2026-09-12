import type { DnsStep } from "./dns.schema";

const roles = [
  ["application", "Application"], ["stub", "Stub resolver"], ["recursive", "Recursive resolver"],
  ["root", "Root server"], ["tld", "TLD server"], ["authoritative", "Authoritative server"],
] as const;

const labelFor = (role: DnsStep["roles"]["sender"]) => roles.find(([id]) => id === role)?.[1] ?? role;

export function DnsTopology({ step }: { step: DnsStep }) {
  const direction = `${labelFor(step.roles.sender)} to ${labelFor(step.roles.receiver)}`;
  return (
    <section className="dns-topology" role="region" aria-label="Active DNS exchange">
      <p className="dns-active-exchange"><strong>Active exchange</strong>: {direction}</p>
      <ol className="dns-role-list">
        {roles.map(([id, label]) => {
          const active = id === step.roles.sender || id === step.roles.receiver;
          return <li key={id} className={active ? "is-active" : undefined}><span>{label}</span>{active && <small>{id === step.roles.sender ? "Sends" : "Receives"}</small>}</li>;
        })}
      </ol>
      <div className="dns-topology__transit" aria-label={`${direction}: packet in transit`}>
        <span>{labelFor(step.roles.sender)}</span>
        <span className="dns-topology__track"><span key={step.id} className="dns-topology__packet" data-packet-envelope="true" aria-hidden="true">✉</span></span>
        <span>{labelFor(step.roles.receiver)}</span>
      </div>
    </section>
  );
}
