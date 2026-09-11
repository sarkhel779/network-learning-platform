import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PremiumPreview } from "./premium-preview";

afterEach(cleanup);

describe("PremiumPreview", () => {
  it("sends the default action to the waitlist without checkout language", () => {
    render(<PremiumPreview><p>Upcoming lesson topics</p></PremiumPreview>);
    expect(screen.getByRole("link", { name: "Join the Pro Member Waitlist" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("complementary")).not.toHaveTextContent(/checkout|buy now|purchase/i);
    expect(screen.getByText("Upcoming lesson topics")).toBeVisible();
  });

  it("uses the lesson-specific waitlist label and destination", () => {
    render(<PremiumPreview ctaLabel="Join the Pro Member Waitlist" ctaHref="/contact"><p>Future advanced practice</p></PremiumPreview>);
    expect(screen.getByRole("link", { name: "Join the Pro Member Waitlist" })).toHaveAttribute("href", "/contact");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("complementary", { name: "Premium lesson preview" })).toHaveTextContent("Future advanced practice");
  });
});
