"use client";

export type FlowPoint = { x: number; y: number };
export type FlowNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  sublabel?: string;
  shape?: "rect" | "ellipse";
  state?: "idle" | "active" | "blocked";
};
export type FlowLink = { from: string; to: string; waypoints?: FlowPoint[]; traveled?: boolean };

const VIEW_WIDTH = 400;
const VIEW_HEIGHT = 260;

export function FlowDiagram({ ariaLabel, nodes, links }: { ariaLabel: string; nodes: FlowNode[]; links: FlowLink[] }) {
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));

  return (
    <div className="flow-diagram" role="img" aria-label={ariaLabel} style={{ aspectRatio: `${VIEW_WIDTH} / ${VIEW_HEIGHT}` }}>
      <svg className="flow-diagram__lines" viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <marker id="flow-diagram-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" className="flow-diagram__arrowhead" />
          </marker>
          <marker id="flow-diagram-arrow-active" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" className="flow-diagram__arrowhead flow-diagram__arrowhead--traveled" />
          </marker>
        </defs>
        {links.map((link) => {
          const from = byId[link.from];
          const to = byId[link.to];
          if (!from || !to) return null;
          const points = link.waypoints ?? [{ x: from.x, y: from.y }, { x: to.x, y: to.y }];
          const d = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
          return (
            <path
              key={`${link.from}-${link.to}`}
              d={d}
              className={`flow-diagram__edge ${link.traveled ? "flow-diagram__edge--traveled" : ""}`}
              markerEnd={`url(#flow-diagram-arrow${link.traveled ? "-active" : ""})`}
            />
          );
        })}
      </svg>
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`flow-diagram__node flow-diagram__node--${node.shape ?? "rect"} flow-diagram__node--${node.state ?? "idle"}`}
          style={{ left: `${(node.x / VIEW_WIDTH) * 100}%`, top: `${(node.y / VIEW_HEIGHT) * 100}%` }}
        >
          <strong>{node.label}</strong>
          {node.sublabel ? <small>{node.sublabel}</small> : null}
        </div>
      ))}
    </div>
  );
}
