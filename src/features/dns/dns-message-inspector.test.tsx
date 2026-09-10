import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DnsMessageInspector } from "./dns-message-inspector";
import { DnsTopology } from "./dns-topology";
import { resolutionScenarios } from "./resolution-journeys";

const cold = resolutionScenarios.find(({ id }) => id === "cold-cache")!;

afterEach(cleanup);

describe("DNS inspection views", () => {
  it("shows every DNS header field and all four message sections", () => {
    const referral = cold.steps.find(({ id }) => id === "root-referral")!;
    render(<DnsMessageInspector message={referral.message} />);
    const header = screen.getByRole("table", { name: /dns header/i });
    for (const field of ["ID", "QR", "OPCODE", "AA", "TC", "RD", "RA", "AD", "CD", "RCODE", "QDCOUNT", "ANCOUNT", "NSCOUNT", "ARCOUNT"]) {
      expect(header).toHaveTextContent(field);
    }
    expect(screen.getByRole("region", { name: /question section/i })).toHaveTextContent("www.example.test.");
    expect(screen.getByRole("region", { name: /answer section/i })).toHaveTextContent("No records");
    expect(screen.getByRole("region", { name: /authority section/i })).toHaveTextContent("NS");
    expect(screen.getByRole("region", { name: /additional section/i })).toHaveTextContent("A");
  });

  it("labels record facts and keeps wide sections locally focusable", () => {
    const referral = cold.steps.find(({ id }) => id === "root-referral")!;
    render(<DnsMessageInspector message={referral.message} />);
    const authority = screen.getByRole("region", { name: /authority section/i });
    expect(authority).toHaveAttribute("tabindex", "0");
    expect(authority).toHaveTextContent("Owner");
    expect(authority).toHaveTextContent("TTL");
    expect(authority).toHaveTextContent("RDLENGTH");
    expect(authority).toHaveTextContent("Purpose");
  });

  it("renders a stable role topology with only the authored exchange active", () => {
    const referral = cold.steps.find(({ id }) => id === "root-referral")!;
    render(<DnsTopology step={referral} />);
    const topology = screen.getByRole("region", { name: /active dns exchange/i });
    for (const role of ["Application", "Stub resolver", "Recursive resolver", "Root server", "TLD server", "Authoritative server"]) {
      expect(topology).toHaveTextContent(role);
    }
    expect(topology).toHaveTextContent("Root server to Recursive resolver");
    expect(screen.getAllByText("Active exchange")).toHaveLength(1);
  });
});
