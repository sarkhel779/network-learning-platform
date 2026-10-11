import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SubnetBlockLab } from "./subnet-block-lab";
import { subnetMaskSim } from "./subnet-mask-sim";

afterEach(cleanup);

function hopGroup(index: number) {
  return within(screen.getAllByRole("group", { name: "Pick one" })[index]);
}

describe("SubnetBlockLab", () => {
  it("hides every hop and the bar until Start is clicked", () => {
    render(<SubnetBlockLab config={subnetMaskSim} />);
    expect(screen.getByText(subnetMaskSim.intro)).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText(subnetMaskSim.hops[0].prompt)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(screen.getByText(subnetMaskSim.hops[0].prompt)).toBeVisible();
  });

  it("rejects a wrong answer without showing the bar, then shows it once answered correctly", () => {
    render(<SubnetBlockLab config={subnetMaskSim} />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    const hop = subnetMaskSim.hops[0];
    const wrongOption = hop.options.find((option) => option.id !== hop.correctId)!;
    fireEvent.click(hopGroup(0).getByRole("radio", { name: wrongOption.label }));
    fireEvent.click(hopGroup(0).getByRole("button", { name: "Check" }));
    expect(screen.getByText("Not correct — try again.")).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    const correctOption = hop.options.find((option) => option.id === hop.correctId)!;
    fireEvent.click(hopGroup(0).getByRole("radio", { name: correctOption.label }));
    fireEvent.click(hopGroup(0).getByRole("button", { name: "Check" }));
    const bar = screen.getByRole("img");
    expect(within(bar).getByText("62 usable")).toBeInTheDocument();
  });

  it("replaces the bar's contents for each independent hop rather than accumulating them", () => {
    render(<SubnetBlockLab config={subnetMaskSim} />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    for (let i = 0; i < 2; i += 1) {
      const hop = subnetMaskSim.hops[i];
      const correctOption = hop.options.find((option) => option.id === hop.correctId)!;
      fireEvent.click(hopGroup(i).getByRole("radio", { name: correctOption.label }));
      fireEvent.click(hopGroup(i).getByRole("button", { name: "Check" }));
      if (i < 1) fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    }

    const bar = screen.getByRole("img");
    expect(within(bar).queryByText("62 usable")).not.toBeInTheDocument();
    expect(within(bar).getByText("14 usable")).toBeInTheDocument();
  });

  it("walks every hop and shows the completion message on Finish", () => {
    render(<SubnetBlockLab config={subnetMaskSim} />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    for (let i = 0; i < subnetMaskSim.hops.length; i += 1) {
      const hop = subnetMaskSim.hops[i];
      const correctOption = hop.options.find((option) => option.id === hop.correctId)!;
      fireEvent.click(hopGroup(i).getByRole("radio", { name: correctOption.label }));
      fireEvent.click(hopGroup(i).getByRole("button", { name: "Check" }));
      const isLast = i === subnetMaskSim.hops.length - 1;
      fireEvent.click(screen.getByRole("button", { name: isLast ? "Finish" : "Continue" }));
    }

    expect(screen.getByText(subnetMaskSim.completionMessage)).toBeVisible();
    expect(screen.getByRole("button", { name: "Restart" })).toBeVisible();
  });
});
