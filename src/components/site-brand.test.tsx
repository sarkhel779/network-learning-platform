import { cleanup, render, screen } from "@testing-library/react";
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
    expect(screen.getByText("Packet", { selector: ".site-logo__packet" })).toBeVisible();
    expect(screen.getByText("secrets", { selector: ".site-logo__secrets" })).toBeVisible();
    expect(screen.getByText("Packetsecrets", { selector: "footer p" })).toBeVisible();
  });

  it("uses the production brand and domain in page metadata", () => {
    expect(metadata.title).toBe("Packetsecrets");
    expect(metadata.metadataBase?.href).toBe("https://packetsecrets.com/");
  });
});
