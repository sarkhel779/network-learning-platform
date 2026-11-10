import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";

import { PathwayToc } from "./pathway-toc";

afterEach(cleanup);

const modules = [
  { id: "module_one", title: "Computer Network Basics" },
  { id: "module_two", title: "Ethernet, Switching and Local Networks" },
];

describe("PathwayToc", () => {
  it("shows every module link by default", () => {
    render(<PathwayToc modules={modules} />);

    const nav = screen.getByRole("navigation", { name: "Jump to module" });
    expect(within(nav).getAllByRole("link")).toHaveLength(2);
    expect(screen.getByRole("button", { name: /jump to module/i })).toHaveAttribute("aria-expanded", "true");
  });

  it("hides the links and flips aria-expanded when the toggle is clicked, then restores them on a second click", async () => {
    const user = userEvent.setup();
    render(<PathwayToc modules={modules} />);

    const toggle = screen.getByRole("button", { name: /jump to module/i });
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});
