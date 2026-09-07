import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { getPathway } from "./catalog.repository";
import { ModuleList } from "./module-list";

afterEach(cleanup);

describe("ModuleList publication labels", () => {
  it("marks a published lesson Free and preserves its canonical link", () => {
    const pathway = getPathway("networking-foundations");
    render(<ModuleList modules={pathway.modules} pathwaySlug={pathway.slug} />);
    const link = screen.getByRole("link", { name: "What Is a Computer Network?" });
    const card = link.closest("li")!;
    expect(within(card).getByText("Free")).toBeVisible();
    expect(within(card).queryByText("Premium")).toBeNull();
    expect(link).toHaveAttribute("href", "/learn/networking-foundations/how-networks-communicate");
  });

  it("describes unpublished lessons as Coming later without Free or Premium access claims", () => {
    const pathway = getPathway("networking-foundations");
    render(<ModuleList modules={pathway.modules} pathwaySlug={pathway.slug} />);
    const card = screen.getByRole("heading", { name: "ARP and Local Delivery" }).closest("li")!;
    expect(within(card).getByText("Coming later")).toBeVisible();
    expect(within(card).queryByText(/^(Free|Premium)$/)).toBeNull();
    expect(within(card).queryByRole("link")).toBeNull();
  });
});
