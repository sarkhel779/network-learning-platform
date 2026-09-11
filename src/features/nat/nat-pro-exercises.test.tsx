import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { NatCaptureAnalysisLab } from "./nat-capture-analysis-lab";
import { natCaptureCases, natRfcChecks } from "./nat-pro-exercises";
import { NatRfcValidationLab } from "./nat-rfc-validation-lab";

afterEach(cleanup);

describe("NAT Pro packet evidence", () => {
  it("provides interface, direction, tuple, flags, and evidence for each capture row", () => {
    expect(natCaptureCases.map(({ id }) => id)).toEqual(["pat-two-sided-capture", "pat-return-path", "udp-timeout-reuse", "icmp-quoted-packet", "fragment-checksum-evidence"]);
    for (const capture of natCaptureCases) {
      for (const row of capture.rows) {
        expect(row).toEqual(expect.objectContaining({ interface: expect.any(String), direction: expect.any(String), tuple: expect.any(Object), flags: expect.any(String), evidence: expect.any(String) }));
      }
    }
  });

  it("switches capture evidence and resets the previous diagnosis", async () => {
    const user = userEvent.setup();
    render(<NatCaptureAnalysisLab />);
    await user.selectOptions(screen.getByLabelText("Capture scenario"), "3");
    expect(screen.getByText(/quotes the translated TCP tuple/i)).toBeVisible();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("immediately explains an attempted capture diagnosis", async () => {
    const user = userEvent.setup();
    render(<NatCaptureAnalysisLab />);
    await user.click(screen.getByLabelText("The server changed its certificate"));
    await user.click(screen.getByRole("button", { name: "Analyze capture" }));
    expect(screen.getByRole("status")).toHaveTextContent(/inside and outside tuples/i);
  });
});

describe("NAT RFC validation", () => {
  it("covers hairpinning, TCP, ICMP, checksums, fragments, and ALG cautions", () => {
    expect(natRfcChecks.map((check) => check.topic)).toEqual([
      "UDP hairpin source", "TCP hairpin support", "ICMP translation", "Checksum repair", "IP fragments", "ALG caution",
    ]);
    expect(natRfcChecks[0].explanation).toMatch(/external.*address.*port/i);
  });

  it("reveals the RFC rule and operational consequence after every choice", async () => {
    const user = userEvent.setup();
    render(<NatRfcValidationLab />);
    await user.click(screen.getByLabelText("Preserve the internal source tuple"));
    await user.click(screen.getByRole("button", { name: "Check RFC behavior" }));
    expect(screen.getByRole("status")).toHaveTextContent(/RFC 4787/i);
    expect(screen.getByRole("status")).toHaveTextContent(/return path/i);
    expect(screen.getByRole("link", { name: "RFC 4787" })).toHaveAttribute("href", "https://www.rfc-editor.org/rfc/rfc4787");
  });
});
