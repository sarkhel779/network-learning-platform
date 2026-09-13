import { cleanup, render, screen } from "@testing-library/react";
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
});
