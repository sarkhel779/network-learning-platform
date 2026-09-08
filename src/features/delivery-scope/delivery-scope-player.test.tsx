import { cleanup, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMDXComponents } from "../../../mdx-components";
import { DeliveryScopePlayer } from "./delivery-scope-player";

beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("DeliveryScopePlayer", () => {
  it("server-renders a complete first scenario in a safe reduced-motion state", () => {
    const markup = renderToStaticMarkup(<DeliveryScopePlayer />);
    expect(markup).toContain("Known HTTPS unicast");
    expect(markup).toContain("data-motion=\"reduced\"");
    expect(markup).toContain("Forwarded");
    expect(markup).toContain("Host B — subscriber");
  });

  it("shows a stable topology and four separately named result regions", () => {
    render(<DeliveryScopePlayer />);
    expect(screen.getByRole("img", { name: /Sender through a switch to three hosts, a router, and a remote host/ })).toBeVisible();
    for (const name of ["Forwarded", "Received", "Accepted", "Router boundary"]) {
      expect(screen.getByRole("region", { name })).toBeVisible();
    }
  });

  it("changes meaningful text and preserves unicast identity when unknown unicast floods", async () => {
    const user = userEvent.setup();
    render(<DeliveryScopePlayer />);
    await user.click(screen.getByRole("radio", { name: "Unknown unicast flood" }));
    expect(screen.getByText(/Unicast destination: Host B/)).toBeVisible();
    expect(screen.getByText(/Flooded, still unicast/)).toBeVisible();
    expect(within(screen.getByRole("region", { name: "Received" })).getByText(/Host C/)).toBeVisible();
    expect(within(screen.getByRole("region", { name: "Accepted" })).queryByText(/Host C/)).toBeNull();
  });

  it("distinguishes subscribers from non-subscribers with and without group-aware state", async () => {
    const user = userEvent.setup();
    render(<DeliveryScopePlayer />);
    await user.click(screen.getByRole("radio", { name: "Multicast without group-aware state" }));
    expect(within(screen.getByRole("region", { name: "Received" })).getByText(/non-subscriber/)).toBeVisible();
    expect(within(screen.getByRole("region", { name: "Accepted" })).queryByText(/non-subscriber/)).toBeNull();
    await user.click(screen.getByRole("radio", { name: "Known multicast subscribers" }));
    expect(within(screen.getByRole("region", { name: "Received" })).queryByText(/non-subscriber/)).toBeNull();
  });

  it("registers only the public player in the shared MDX map", () => {
    const components = useMDXComponents({});
    expect(components.DeliveryScopePlayer).toBe(DeliveryScopePlayer);
    expect(components).not.toHaveProperty("DeliveryScopeLab");
  });

  it("provides 44px controls and scoped non-colour state styling", () => {
    const style = document.head.appendChild(document.createElement("style"));
    style.textContent = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");
    try {
      render(<DeliveryScopePlayer />);
      for (const radio of screen.getAllByRole("radio")) expect(Number.parseFloat(getComputedStyle(radio.closest("label")!).minBlockSize)).toBeGreaterThanOrEqual(44);
      expect(style.textContent).toMatch(/\.delivery-scope-results/);
    } finally { style.remove(); }
  });
});
