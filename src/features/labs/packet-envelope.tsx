"use client";

import { useState } from "react";

import type { PacketLayer } from "./packet-forwarding/packet-journey-scenarios";

export function PacketEnvelope({ ariaLabel, layers }: { ariaLabel: string; layers: PacketLayer[] }) {
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set(layers[0] ? [layers[0].id] : []));

  function toggle(id: string) {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="packet-envelope" aria-label={ariaLabel}>
      {layers.map((layer, depth) => {
        const open = openIds.has(layer.id);
        const changedCount = layer.fields.filter((field) => field.changed).length;
        return (
          <div className="packet-envelope__layer" key={layer.id} style={{ marginInlineStart: `${depth * 1.1}rem` }}>
            <button type="button" className="packet-envelope__summary" aria-expanded={open} onClick={() => toggle(layer.id)}>
              <span className="packet-envelope__caret" aria-hidden="true">{open ? "▾" : "▸"}</span>
              {layer.label}
              {changedCount > 0 ? <span className="packet-envelope__badge">{changedCount} changed</span> : null}
            </button>
            {open ? (
              <dl className="packet-envelope__fields">
                {layer.fields.map((field) => (
                  <div key={field.label} data-changed={field.changed ? "true" : "false"}>
                    <dt>{field.label}</dt>
                    <dd>{field.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
