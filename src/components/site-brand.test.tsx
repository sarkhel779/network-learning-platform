import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { metadata } from "@/app/layout";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

afterEach(cleanup);

describe("Packetsecrets site branding", () => {
  it("identifies the site consistently in its visible chrome", () => {
    render(
      <>
        <SiteHeader />
        <SiteFooter />
      </>,
    );

    expect(screen.getByRole("link", { name: "Packetsecrets" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Packetsecrets", { selector: ".site-logo__wordmark" })).toBeVisible();
    expect(screen.getByText("Packetsecrets", { selector: "footer p" })).toBeVisible();
  });

  it("uses the production brand and domain in page metadata", () => {
    expect(metadata.title).toBe("Packetsecrets");
    expect(metadata.metadataBase?.href).toBe("https://packetsecrets.com/");
  });

  it("lets learners toggle and retain light or dark appearance", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const themeControl = screen.getByRole("switch", { name: "Dark mode" });
    expect(themeControl).toHaveAttribute("aria-checked", "true");
    await user.click(themeControl);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("packetsecrets-theme")).toBe("light");
  });
});
