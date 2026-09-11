import { useId } from "react";

import type { TroubleshootingScenario } from "./troubleshooting-scenario.schema";

type Props = { topology: TroubleshootingScenario["topology"]; activePath?: string[] };

export function TroubleshootingTopology({ topology, activePath = [] }: Props) {
  const titleId = useId();
  const active = new Set(activePath);
  const nodes = new Map(topology.nodes.map((node) => [node.id, node]));
  return <section className="troubleshooting-topology" aria-labelledby={titleId}>
    <h3 id={titleId}>Current network path</h3>
    <div className="troubleshooting-topology__map" role="img" aria-label="Branch troubleshooting topology">
      {topology.nodes.map((node) => <div className="troubleshooting-topology__hop" key={node.id}>
        <article className="troubleshooting-topology__node" data-active={active.has(node.id)} data-kind={node.kind}>
          <span aria-hidden="true" className="troubleshooting-topology__icon">{node.kind.slice(0, 1).toUpperCase()}</span>
          <strong data-active={active.has(node.id)}>{node.label}</strong>
          <small>{node.kind}</small>
        </article>
      </div>)}
    </div>
    <ul className="troubleshooting-topology__connections" aria-label="Topology connections">
      {topology.links.map((link) => <li key={link.id}><strong>{nodes.get(link.from)?.label}</strong> {link.fromInterface} to <strong>{nodes.get(link.to)?.label}</strong> {link.toInterface}</li>)}
    </ul>
  </section>;
}
