import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import LabsPage from "./page";

describe("Labs entry points", () => {
  it("presents the sample experiment and existing lesson practice destinations", () => {
    const html = renderToStaticMarkup(<LabsPage />);
    expect(html).toContain("Sample packet experiment");
    expect(html).toContain("/learn/networking-foundations/first-packet-journey-through-a-small-network#complete-packet-journey");
    expect(html).toContain("/learn/networking-foundations/dhcp-and-automatic-address-configuration#interactive-dora-journey");
    expect(html).toContain("Browse lesson quizzes");
    expect(html).toContain('href="/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Ffirst-packet-journey-through-a-small-network%23knowledge-check-summary"');
  });

  it("exposes Labs in real site navigation without placeholder sections", () => {
    const html = renderToStaticMarkup(<><SiteHeader /><SiteFooter /></>);
    expect(html).toContain('href="/labs"');
    expect(html).toContain('href="/paths/networking-foundations"');
    expect(html).toContain('href="/sign-in"');
    expect(html).toContain("Get started");
    expect(html).not.toMatch(/href="\/(blog|community|resources)"/);
  });
});
