import type { NatStep } from "./nat-scenario.schema";

const labels: Record<string, string> = {
  client: "Internal client",
  gateway: "NAT gateway",
  internet: "Internet",
  "remote-server": "Remote HTTPS server",
  "internal-server": "Internal HTTPS server",
};

export function NatTopology({ step, outcome }: { step: NatStep; outcome?: "success" | "failure" }) {
  const nodes = Array.from(new Set(["client", "gateway", step.from, step.to, step.to === "internet" ? "remote-server" : ""])).filter(Boolean);
  const direction = nodes.indexOf(step.from) <= nodes.indexOf(step.to) ? "forward" : "reverse";
  return (
    <div className="nat-topology" data-outcome={outcome} aria-label="NAT packet path">
      <div className="nat-topology__nodes">
        {nodes.map((node) => (
          <div key={node} className="nat-topology__node" data-active={node === step.from || node === step.to ? "true" : undefined}>
            <span aria-hidden="true">{node === "gateway" ? "⇄" : node.includes("server") ? "▤" : "▣"}</span>
            <strong>{labels[node] ?? node}</strong>
          </div>
        ))}
      </div>
      <div className="nat-topology__link" aria-label={`${labels[step.from] ?? step.from} to ${labels[step.to] ?? step.to}`}>
        <span key={step.id} className="nat-topology__packet" data-direction={direction} data-testid="nat-packet" data-step={step.id} aria-hidden="true" />
      </div>
      <p><strong>Active path:</strong> {labels[step.from] ?? step.from} → {labels[step.to] ?? step.to}</p>
    </div>
  );
}
