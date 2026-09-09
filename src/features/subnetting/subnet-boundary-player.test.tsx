import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SubnetBoundaryPlayer } from "./subnet-boundary-player";

describe("SubnetBoundaryPlayer", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });
  it("starts with a complete labelled /26 calculation and playback controls", () => {
    render(<SubnetBoundaryPlayer />);
    expect(screen.getByText("192.0.2.130/26")).toBeInTheDocument();
    expect(screen.getByText(/255\.255\.255\.192/)).toBeInTheDocument();
    expect(screen.getByText(/Network bits/)).toBeInTheDocument();
    for (const name of ["Previous", "Pause", "Next", "Restart"])
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Playback speed" })).toBeInTheDocument();
  });

  it("supports manual steps and recalculates when the scenario changes", async () => {
    const user = userEvent.setup();
    render(<SubnetBoundaryPlayer />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent("Subnet mask");
    await user.click(screen.getByRole("radio", { name: "Point-to-point /31" }));
    expect(screen.getByText("192.0.2.10/31")).toBeInTheDocument();
    expect(screen.getByText(/No broadcast address/)).toBeInTheDocument();
  });
});
