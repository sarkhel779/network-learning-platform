import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import LabsPage from "./page";

describe("Labs entry points", () => {
  it("presents independent lab topics with no links into course lessons", () => {
    const html = renderToStaticMarkup(<LabsPage />);
    expect(html).toContain("Packet Forwarding");
    expect(html).toContain("IP Addressing &amp; Subnetting");
    expect(html).toContain('href="/labs/packet-forwarding"');
    expect(html).toContain('href="/labs/ip-subnetting"');
    expect(html).not.toMatch(/href="\/learn\//);
    expect(html).not.toContain("/sign-in");
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
