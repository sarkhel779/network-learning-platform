import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { NatTableEntry, NatTuple } from "./nat-scenario.schema";
import { PacketTupleInspector } from "./packet-tuple-inspector";
import { TranslationTableInspector } from "./translation-table-inspector";

afterEach(cleanup);

const tuple: NatTuple = {
  protocol: "tcp",
  sourceIp: "10.0.0.25",
  sourcePort: 51514,
  destinationIp: "198.51.100.20",
  destinationPort: 443,
};

const entry: NatTableEntry = {
  id: "pat-1",
  protocol: "tcp",
  insideLocal: "10.0.0.25:51514",
  insideGlobal: "203.0.113.10:62001",
  outsideGlobal: "198.51.100.20:443",
  state: "active",
};

describe("PacketTupleInspector", () => {
  it("exposes the complete packet tuple and highlights translated evidence", () => {
    render(<PacketTupleInspector tuple={tuple} translations={[
      { kind: "snat", field: "sourceIp", before: "10.0.0.25", after: "203.0.113.10" },
    ]} />);

    expect(screen.getByText("10.0.0.25:51514")).toBeVisible();
    expect(screen.getByText("198.51.100.20:443")).toBeVisible();
    expect(screen.getByText("203.0.113.10")).toHaveAttribute("data-translated", "true");
  });

  it("announces a tuple mismatch against the expected peer", () => {
    render(<PacketTupleInspector tuple={{ ...tuple, sourceIp: "10.0.0.50" }} translations={[]} expectedTuple={tuple} />);
    expect(screen.getByRole("status")).toHaveTextContent(/source IP mismatch/i);
  });
});

describe("TranslationTableInspector", () => {
  it("renders a captioned table and identifies the active mapping", () => {
    render(<TranslationTableInspector entries={[entry]} activeEntryId="pat-1" />);
    expect(screen.getByText("NAT translation table")).toBeVisible();
    expect(screen.getByRole("row", { name: /pat-1/i })).toHaveAttribute("data-active", "true");
  });

  it("explains when no mapping exists", () => {
    render(<TranslationTableInspector entries={[]} />);
    expect(screen.getByText(/no active translation/i)).toBeVisible();
  });
});
