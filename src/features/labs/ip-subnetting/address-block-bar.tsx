"use client";

import type { BlockSegment } from "./subnet-block-types";

export function AddressBlockBar({ ariaLabel, totalUnits, segments }: { ariaLabel: string; totalUnits: number; segments: BlockSegment[] }) {
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const cells: { width: number; label?: string; role: BlockSegment["role"] | "empty" }[] = [];
  let cursor = 0;
  for (const segment of sorted) {
    if (segment.start > cursor) {
      cells.push({ width: segment.start - cursor, role: "empty" });
    }
    cells.push({ width: segment.end - segment.start + 1, label: segment.label, role: segment.role });
    cursor = segment.end + 1;
  }
  if (cursor < totalUnits) {
    cells.push({ width: totalUnits - cursor, role: "empty" });
  }

  return (
    <div className="address-block-bar" role="img" aria-label={ariaLabel}>
      {cells.map((cell, index) => (
        <div
          key={index}
          className={`address-block-bar__cell address-block-bar__cell--${cell.role}`}
          style={{ flexGrow: cell.width }}
        >
          {cell.label ? <span>{cell.label}</span> : null}
        </div>
      ))}
    </div>
  );
}
