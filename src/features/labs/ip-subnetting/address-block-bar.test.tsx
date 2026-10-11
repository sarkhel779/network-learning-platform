import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AddressBlockBar } from "./address-block-bar";

afterEach(cleanup);

describe("AddressBlockBar", () => {
  it("renders labeled segments and fills gaps before, between, and after them as empty cells", () => {
    render(
      <AddressBlockBar
        ariaLabel="test bar"
        totalUnits={16}
        segments={[
          { start: 4, end: 4, label: "Network", role: "network" },
          { start: 5, end: 10, label: "Usable", role: "usable" },
        ]}
      />,
    );
    const bar = screen.getByRole("img", { name: "test bar" });
    expect(within(bar).getByText("Network")).toBeInTheDocument();
    expect(within(bar).getByText("Usable")).toBeInTheDocument();
    expect(bar.children).toHaveLength(4);
    expect(bar.children[0]).toHaveClass("address-block-bar__cell--empty");
    expect(bar.children[3]).toHaveClass("address-block-bar__cell--empty");
  });
});
