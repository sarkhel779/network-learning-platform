import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CaptureAnalysisLab } from "./capture-analysis-lab";
import { captureExercises, rfcExercises } from "./pro-exercises";
import { RfcValidationLab } from "./rfc-validation-lab";

const services = ["web", "remote-access", "email", "file-transfer", "time", "monitoring"] as const;
afterEach(cleanup);

describe("essential-services Pro exercises", () => {
  it("provides validated capture and RFC evidence for all six services", () => {
    for (const service of services) {
      expect(captureExercises[service].length).toBeGreaterThan(0);
      expect(rfcExercises[service].length).toBeGreaterThan(0);
      expect(rfcExercises[service][0].referenceUrl).toMatch(/^https:\/\/www\.rfc-editor\.org\//);
    }
  });

  it("renders an accessible capture conversation", () => {
    render(<CaptureAnalysisLab service="time" />);
    expect(screen.getByRole("table", { name: /NTP capture/i })).toBeVisible();
    expect(screen.getByText(/udp\.port == 123/i)).toBeVisible();
  });

  it("renders immediate RFC evidence with an authoritative reference", () => {
    render(<RfcValidationLab service="monitoring" />);
    expect(screen.getByRole("link", { name: /^RFC / })).toHaveAttribute("href", expect.stringMatching(/^https:\/\/www\.rfc-editor\.org\//));
    expect(screen.getByRole("button", { name: "Check RFC decision" })).toBeDisabled();
  });
});
