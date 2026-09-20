import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RouterBoundaryPlacement } from "./router-boundary-placement";

describe("RouterBoundaryPlacement", () => {
  it("places a router between two differently named networks", async () => {
    const user = userEvent.setup();
    render(<RouterBoundaryPlacement />);
    expect(screen.getByText(/routers connect different ip networks/i)).toBeVisible();
    await user.tab();
    expect(screen.getByRole("button", { name: /between office lan and internet/i })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: /between office lan and internet/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/correct boundary/i);
  });
});
