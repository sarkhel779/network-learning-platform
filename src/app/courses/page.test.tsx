import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import CoursesPage from "./page";

describe("Courses index", () => {
  it("lists every pathway with a link to its overview page", () => {
    const html = renderToStaticMarkup(<CoursesPage />);
    expect(html).toContain("Networking Foundations");
    expect(html).toContain('href="/paths/networking-foundations"');
    expect(html).toContain("Routing Protocols");
    expect(html).toContain('href="/paths/routing-protocols"');
  });

  it("is reachable from the header and footer navigation", () => {
    const html = renderToStaticMarkup(<><SiteHeader /><SiteFooter /></>);
    expect(html).toContain('href="/courses"');
  });
});
