import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LayerMatchingExercise } from "./layer-matching-exercise";

describe("LayerMatchingExercise", () => {
  it("matches familiar technologies to introductory layers", async () => {
    const user = userEvent.setup();
    render(<LayerMatchingExercise />);
    expect(screen.getByText(/layered models divide networking work/i)).toBeVisible();
    await user.tab();
    expect(screen.getByLabelText(/dns belongs to/i)).toHaveFocus();
    await user.selectOptions(screen.getByLabelText(/dns belongs to/i), "application");
    expect(screen.getByRole("status")).toHaveTextContent(/correct/i);
  });
});
