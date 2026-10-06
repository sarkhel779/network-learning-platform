"use client";

import type { ReactNode } from "react";

export type CanvasNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  sublabel?: string;
  icon: ReactNode;
  state?: "idle" | "active" | "blocked";
};

export type CanvasLink = { from: string; to: string };

export function NetworkCanvas({
  ariaLabel,
  nodes,
  links,
  packetAt,
  packetVisible = true,
}: {
  ariaLabel: string;
  nodes: CanvasNode[];
  links: CanvasLink[];
  packetAt?: string | null;
  packetVisible?: boolean;
}) {
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const packetNode = packetAt ? byId[packetAt] : null;

  return (
    <div className="network-canvas" role="img" aria-label={ariaLabel}>
      <svg className="network-canvas__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {links.map((link) => {
          const from = byId[link.from];
          const to = byId[link.to];
          if (!from || !to) return null;
          return <line key={`${link.from}-${link.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
        })}
      </svg>
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`network-canvas__node network-canvas__node--${node.state ?? "idle"}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <span className="network-canvas__icon">{node.icon}</span>
          <strong>{node.label}</strong>
          {node.sublabel ? <small>{node.sublabel}</small> : null}
        </div>
      ))}
      {packetVisible && packetNode ? (
        <div className="network-canvas__packet" aria-hidden="true" style={{ left: `${packetNode.x}%`, top: `${packetNode.y}%` }}>▣</div>
      ) : null}
    </div>
  );
}
