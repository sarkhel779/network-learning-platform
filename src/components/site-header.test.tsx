import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("offers a direct dashboard entry from every page", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("navigation", { name: "Primary navigation" })
      .querySelector('a[href="/dashboard"]')).toHaveTextContent("My dashboard");
  });
});
