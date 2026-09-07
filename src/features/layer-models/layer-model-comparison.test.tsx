import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LayerModelComparison } from "./layer-model-comparison";

afterEach(cleanup);

describe("LayerModelComparison", () => {
  it("renders the two models as semantic lists with descriptive layer details", () => {
    const { container } = render(<LayerModelComparison />);

    expect(screen.getAllByRole("list")).toHaveLength(2);
    expect(screen.getAllByRole("listitem")).toHaveLength(11);
    expect(screen.getByText("Application", { selector: "[data-tcp-ip-layer]" })).toBeVisible();
    expect(screen.getByText(/OSI layers 7, 6, and 5/)).toBeVisible();

    expect(screen.getByText(/Provides network services to user applications/)).toBeVisible();
    expect(screen.getAllByText((_, element) =>
      element?.tagName === "P" && element.textContent === "Examples: HTTP, DNS, DHCP",
    )[0]).toBeVisible();
    expect(container.querySelector('[data-maps-osi-layers="7 6 5"]')).toBeInTheDocument();
    expect(container.querySelector('[data-maps-to-tcp-ip="application"]')).toBeInTheDocument();

    const connectors = container.querySelectorAll('[data-layer-mapping-connector="true"]');
    expect(connectors).toHaveLength(4);
    connectors.forEach((connector) => expect(connector).toHaveAttribute("aria-hidden", "true"));
  });

});
