import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { CoursesNavDropdown } from "./courses-nav-dropdown";

afterEach(cleanup);

const pathways = [
  { title: "Networking Foundations", slug: "networking-foundations" },
  { title: "Routing Protocols", slug: "routing-protocols" },
];

describe("CoursesNavDropdown", () => {
  it("links the Courses label directly to the courses page", () => {
    render(<CoursesNavDropdown pathways={pathways} active={false} />);
    expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute("href", "/courses");
  });

  it("opens the pathway list from the toggle and closes it again", async () => {
    const user = userEvent.setup();
    render(<CoursesNavDropdown pathways={pathways} active={false} />);
    const toggle = screen.getByRole("button", { name: "Show course list" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Networking Foundations" })).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Networking Foundations" })).toHaveAttribute("href", "/paths/networking-foundations");
    expect(screen.getByRole("link", { name: "Routing Protocols" })).toHaveAttribute("href", "/paths/routing-protocols");
    expect(screen.getByRole("link", { name: "Browse all courses" })).toHaveAttribute("href", "/courses");

    await user.click(screen.getByRole("button", { name: "Hide course list" }));
    expect(screen.queryByRole("link", { name: "Networking Foundations" })).not.toBeInTheDocument();
  });

  it("closes the menu after a pathway link is clicked", async () => {
    const user = userEvent.setup();
    render(<CoursesNavDropdown pathways={pathways} active={false} />);
    await user.click(screen.getByRole("button", { name: "Show course list" }));
    await user.click(screen.getByRole("link", { name: "Networking Foundations" }));
    expect(screen.queryByRole("link", { name: "Routing Protocols" })).not.toBeInTheDocument();
  });

  it("marks the Courses link as the current page when active", () => {
    render(<CoursesNavDropdown pathways={pathways} active />);
    expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute("aria-current", "page");
  });
});
