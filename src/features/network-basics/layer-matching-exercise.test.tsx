import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { LayerMatchingExercise } from "./layer-matching-exercise";

afterEach(cleanup);

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

  it("matches all four model responsibilities without carrying an answer into the next example", async () => {
    const user = userEvent.setup();
    render(<LayerMatchingExercise />);
    const examples = [
      { name: "DNS belongs to", answer: "application", meaning: /application/i },
      { name: "TCP belongs to", answer: "transport", meaning: /transport/i },
      { name: "IP belongs to", answer: "internet", meaning: /internet/i },
      { name: "Ethernet belongs to", answer: "link", meaning: /network access/i },
    ];
    for (const [index, example] of examples.entries()) {
      const choice = screen.getByRole("combobox", { name: example.name });
      expect(choice).toHaveValue("");
      expect(screen.queryByRole("status")).toBeNull();
      await user.selectOptions(choice, example.answer);
      expect(screen.getByRole("status")).toHaveTextContent(/correct/i);
      expect(screen.getByRole("status")).toHaveTextContent(example.meaning);
      if (index < examples.length - 1) await user.click(screen.getByRole("button", { name: "Next example" }));
    }
    expect(screen.getByRole("button", { name: "Next example" })).toBeDisabled();
  });

  it("gives corrective feedback and clears it when navigating or restarting", async () => {
    const user = userEvent.setup();
    render(<LayerMatchingExercise />);
    expect(screen.getByRole("button", { name: "Previous example" })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText("DNS belongs to"), "internet");
    expect(screen.getByRole("status")).toHaveTextContent(/not quite/i);
    expect(screen.getByRole("status")).toHaveTextContent(/DNS is an Application-layer service/i);
    await user.selectOptions(screen.getByLabelText("DNS belongs to"), "application");
    expect(screen.getByRole("status")).not.toHaveTextContent(/not quite/i);
    await user.click(screen.getByRole("button", { name: "Next example" }));
    await user.selectOptions(screen.getByLabelText("TCP belongs to"), "link");
    await user.click(screen.getByRole("button", { name: "Previous example" }));
    expect(screen.getByLabelText("DNS belongs to")).toHaveValue("");
    expect(screen.queryByRole("status")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Next example" }));
    await user.click(screen.getByRole("button", { name: "Restart matching" }));
    expect(screen.getByLabelText("DNS belongs to")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Previous example" })).toBeDisabled();
  });

  it("keeps each exercise's label and selection independent when rendered twice", async () => {
    const user = userEvent.setup();
    render(<><LayerMatchingExercise /><LayerMatchingExercise /></>);
    const regions = screen.getAllByRole("region", { name: "Match a technology to a layer" });
    const first = within(regions[0]).getByLabelText("DNS belongs to");
    const second = within(regions[1]).getByLabelText("DNS belongs to");
    expect(first.id).not.toBe(second.id);
    await user.selectOptions(second, "application");
    expect(first).toHaveValue("");
    expect(within(regions[0]).queryByRole("status")).toBeNull();
    expect(within(regions[1]).getByRole("status")).toHaveTextContent(/correct/i);
  });
});
