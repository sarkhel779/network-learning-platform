import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

afterEach(cleanup);

describe("SiteHeader", () => {
  it("offers a direct dashboard entry from every page", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("navigation", { name: "Primary navigation" })
      .querySelector('a[href="/dashboard"]')).toHaveTextContent("My dashboard");
  });

  it("shows the refreshed navigation without losing working destinations", () => {
    render(<SiteHeader />);
    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(nav.querySelector('a[href="/"]')).toHaveTextContent("Home");
    expect(nav.querySelector('a[href="/paths/networking-foundations"]')).toHaveTextContent("Courses");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
    expect(nav.querySelector('a[href="/labs"]')).toHaveTextContent("Labs");
    expect(nav.querySelector('a[href="/dashboard"]')).toHaveTextContent("My dashboard");
  });

  it("shows the account destination instead of sign in for an authenticated viewer", () => {
    render(<SiteHeader signedIn />);
    expect(screen.getByRole("link", { name: "My account" })).toHaveAttribute("href", "/dashboard");
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });

  it("opens the mobile menu from the hamburger toggle and closes it again", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Close menu" })).toBe(toggle);

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("dismisses the open mobile menu when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<SiteHeader />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const backdrop = container.querySelector(".site-header__backdrop");
    expect(backdrop).not.toBeNull();
    await user.click(backdrop as Element);

    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector(".site-header__backdrop")).toBeNull();
  });

  it("offers a learner dashboard entry without exposing an admin link", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "My dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.queryByRole("link", { name: /admin/i })).not.toBeInTheDocument();
  });
});
