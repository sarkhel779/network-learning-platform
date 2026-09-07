import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { useMDXComponents } from "../../../mdx-components";
import { ConnectionMediaComparison } from "./connection-media-comparison";

afterEach(cleanup);

describe("ConnectionMediaComparison", () => {
  it("server-renders a meaningful default comparison for all three media", () => {
    const markup = renderToStaticMarkup(<ConnectionMediaComparison />);

    expect(markup).toContain("Copper");
    expect(markup).toContain("Fibre");
    expect(markup).toContain("Wireless");
    expect(markup).toContain("Electrical pulses");
    expect(markup).toContain("Light pulses");
    expect(markup).toContain("Radio waves");
    expect(markup).toContain("Common twisted-pair Ethernet channels are intended for nearby runs");
    expect(markup).toContain("Fibre is well suited to links that exceed the practical distance");
    expect(markup).toContain("Wireless range changes with walls");
  });

  it("updates every medium explanation when a comparison quality is selected", async () => {
    const user = userEvent.setup();
    const { container } = render(<ConnectionMediaComparison />);

    expect(screen.getByRole("heading", { name: "Copper" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Fibre" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Wireless" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Compare connection qualities" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "Distance" })).toBeChecked();
    for (const quality of ["Distance", "Bandwidth", "Interference", "Mobility", "Cost"]) {
      expect(screen.getByRole("radio", { name: quality })).toBeVisible();
    }

    await user.click(screen.getByRole("radio", { name: "Interference" }));

    expect(screen.getByText(/Electrical signals can be affected by electromagnetic interference/i)).toBeVisible();
    expect(screen.getByText(/Light in fibre is not affected by electromagnetic interference/i)).toBeVisible();
    expect(screen.getByText(/shared radio environment/i)).toBeVisible();
    expect(container.querySelectorAll("article[aria-labelledby]")).toHaveLength(3);
    expect(container.querySelectorAll("[data-signal]")).toHaveLength(3);
    expect(container.querySelectorAll("[data-signal=\"electrical\"]")).toHaveLength(1);
    expect(container.querySelectorAll("[data-signal=\"optical\"]")).toHaveLength(1);
    expect(container.querySelectorAll("[data-signal=\"radio\"]")).toHaveLength(1);
    expect(container.querySelectorAll("[aria-hidden=\"true\"]").length).toBeGreaterThan(0);
    expect(container.querySelector("[draggable=\"true\"]")).not.toBeInTheDocument();
    for (const scenarioTitle of [
      "Desktop near a home router",
      "Laptop used throughout a small office",
      "Fixed workstation in a noisy workshop",
      "Two buildings on a campus",
      "High-capacity data-centre interconnect",
      "Temporary classroom network",
    ]) {
      expect(screen.queryByText(scenarioTitle)).not.toBeInTheDocument();
    }
  });

  it("registers the public comparison component for MDX", () => {
    const components = useMDXComponents({});

    expect(components.ConnectionMediaComparison).toBe(ConnectionMediaComparison);
  });
});
