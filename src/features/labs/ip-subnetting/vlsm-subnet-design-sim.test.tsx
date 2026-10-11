import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SubnetBlockLab } from "./subnet-block-lab";
import { vlsmSubnetDesignSim } from "./vlsm-subnet-design-sim";

afterEach(cleanup);

function hopGroup(index: number) {
  return within(screen.getAllByRole("group", { name: "Pick one" })[index]);
}

describe("SubnetBlockLab (VLSM scenario)", () => {
  it("accumulates each allocation onto the same bar instead of replacing it", () => {
    render(<SubnetBlockLab config={vlsmSubnetDesignSim} />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    for (let i = 0; i < vlsmSubnetDesignSim.hops.length; i += 1) {
      const hop = vlsmSubnetDesignSim.hops[i];
      const correctOption = hop.options.find((option) => option.id === hop.correctId)!;
      fireEvent.click(hopGroup(i).getByRole("radio", { name: correctOption.label }));
      fireEvent.click(hopGroup(i).getByRole("button", { name: "Check" }));
      const isLast = i === vlsmSubnetDesignSim.hops.length - 1;
      fireEvent.click(screen.getByRole("button", { name: isLast ? "Finish" : "Continue" }));
    }

    const bar = screen.getByRole("img");
    expect(within(bar).getByText("100-host subnet (/25)")).toBeInTheDocument();
    expect(within(bar).getByText("50-host subnet (/26)")).toBeInTheDocument();
    expect(within(bar).getByText("20-host subnet (/27)")).toBeInTheDocument();
    expect(within(bar).getByText("Free / reserved")).toBeInTheDocument();
    expect(screen.getByText(vlsmSubnetDesignSim.completionMessage)).toBeVisible();
  });
});
