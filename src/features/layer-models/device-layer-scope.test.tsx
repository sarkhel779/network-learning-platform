import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DeviceLayerScope } from "./device-layer-scope";

afterEach(cleanup);

describe("DeviceLayerScope", () => {
  it("compares all four shared device symbols with qualified layer scope", () => {
    const { container } = render(<DeviceLayerScope />);

    for (const symbol of ["host", "switch", "router", "firewall"]) {
      expect(container.querySelector(`[data-device-symbol="${symbol}"]`)).toBeInTheDocument();
    }

    const intro = container.querySelector<HTMLElement>(".device-layer-scope__intro");
    expect(intro).not.toBeNull();
    expect(within(intro!).getByText(/commonly examines/i)).toBeVisible();
    expect(screen.getByText(/scope depends on its design/i)).toBeVisible();
    expect(screen.queryByText(/(?:^|\s)(?:only examines|limited to)/i)).not.toBeInTheDocument();
  });
});
