import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("home page visual refresh", () => {
  it("offers the published learning journey without sending visitors to an unavailable lab", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect((html.match(/<h1\b/g) ?? [])).toHaveLength(1);
    expect(html).toContain("One packet at a time.");
    expect(html).toContain("Core Topics You’ll Learn");
    expect(html).toContain("Your learning journey");
    expect(html).toContain("Try the packet lab");
    expect(html).toContain('/learn/networking-foundations/how-networks-communicate');
    expect(html).toContain('/paths/networking-foundations');
    expect(html).not.toContain('href="/labs"');
  });

  it("describes the packet route in text for non-visual readers", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("Example packet route: your device, switch, router, internet, and server");
  });
});
