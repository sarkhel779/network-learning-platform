import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMDXComponents } from "../../../mdx-components";
import { ConnectionMediaComparison } from "./connection-media-comparison";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("ConnectionMediaComparison", () => {
  it("keeps discrete signal stages on the server and under reduced motion", () => {
    const markup = renderToStaticMarkup(<ConnectionMediaComparison />);
    expect(markup.match(/data-motion="reduced"/g)).toHaveLength(3);
    vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
    render(<ConnectionMediaComparison />);
    for (const track of screen.getAllByRole("img", { name: /signal track/ })) {
      expect(track).toHaveAttribute("data-motion", "reduced");
      expect(track).toHaveTextContent("Source");
      expect(track).toHaveTextContent("Medium");
      expect(track).toHaveTextContent("Destination");
    }
  });

  it("enables decorative signal travel only after hydration with no motion preference", () => {
    render(<ConnectionMediaComparison />);
    for (const track of screen.getAllByRole("img", { name: /signal track/ })) {
      expect(track).toHaveAttribute("data-motion", "travel");
    }
  });
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

    const expectedExplanations = {
      Bandwidth: {
        Copper: "Copper Ethernet can provide useful high-speed links when cable category and equipment support the negotiated rate.",
        Fibre: "Fibre supports high-capacity links when the optics and equipment on both ends are compatible.",
        Wireless: "Wireless capacity is shared airtime, so useful throughput depends on signal quality and other active devices.",
      },
      Interference: {
        Copper: "Electrical signals can be affected by electromagnetic interference, so routing and installation matter.",
        Fibre: "Light in fibre is not affected by electromagnetic interference from nearby machinery.",
        Wireless: "A shared radio environment can introduce congestion and interference from nearby networks or equipment.",
      },
      Mobility: {
        Copper: "A cable keeps a fixed device reliably connected but does not support movement while in use.",
        Fibre: "Fibre is a fixed link and needs careful handling rather than supporting moving endpoints.",
        Wireless: "Wireless lets a compatible device move within coverage without carrying a physical cable.",
      },
      Cost: {
        Copper: "Familiar ports, cable, and installation often make nearby copper connections economical.",
        Fibre: "Optics, compatible equipment, and installation can raise the initial cost while enabling longer links.",
        Wireless: "Wireless can avoid running a cable to each mobile device, but coverage and capacity still need planning.",
      },
      Distance: {
        Copper: "Common twisted-pair Ethernet channels are intended for nearby runs, typically up to 100 metres.",
        Fibre: "Fibre is well suited to links that exceed the practical distance of common copper Ethernet.",
        Wireless: "Wireless range changes with walls, obstructions, antenna placement, and signal strength.",
      },
    } as const;

    for (const [quality, explanations] of Object.entries(expectedExplanations)) {
      await user.click(screen.getByRole("radio", { name: quality }));

      for (const [medium, explanation] of Object.entries(explanations)) {
        const heading = screen.getByRole("heading", { name: medium });
        const article = heading.closest("article");

        expect(article, `${medium} panel`).not.toBeNull();
        expect(within(article!).getByText(explanation)).toBeVisible();
      }
    }

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
