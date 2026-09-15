import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/site-header", () => ({ SiteHeader: () => <header>Site header</header> }));
vi.mock("@/components/site-footer", () => ({ SiteFooter: () => <footer>Site footer</footer> }));
vi.mock("@/features/catalog/catalog.repository", () => ({ listPathways: () => [] }));
vi.mock("@/features/analytics/page-view-recorder", () => ({ PageViewRecorder: () => <span data-testid="page-view-recorder" /> }));
vi.mock("@/lib/supabase/session", () => ({ getViewer: () => Promise.resolve(null) }));

import RootLayout from "./layout";

describe("root layout", () => {
  it("mounts one page-view recorder around routed content", async () => {
    const html = renderToStaticMarkup(await RootLayout({ children: <main>Page</main> }));
    expect(html).toContain('data-testid="page-view-recorder"');
    expect(html).toContain("Page");
  });
});
