import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import SignInPage from "./page";

afterEach(cleanup);

describe("temporary sign-in page", () => {
  it.each([
    "/",
    "/paths/networking-foundations",
    "/learn/networking-foundations/how-networks-communicate",
    "/learn/networking-foundations/hosts-and-network-devices",
    "/learn/networking-foundations/osi-and-tcp-ip-models",
  ])("preserves the allow-listed return path %s", async (returnTo) => {
    render(await SignInPage({ searchParams: Promise.resolve({ returnTo }) }));
    expect(screen.getByRole("link", { name: /Back to/ })).toHaveAttribute("href", returnTo);
  });

  it.each([
    undefined, "", "https://example.com", "//example.com", "/\\example.com",
    "javascript:alert(1)", "%2F%2Fexample.com", "/learn/../sign-in",
    "/learn/networking-foundations/not-a-lesson", "/admin",
    "/learn/networking-foundations/how-networks-communicate?next=https://example.com",
    "/learn/networking-foundations/how-networks-communicate#answers",
    " /learn/networking-foundations/how-networks-communicate",
    ["/", "https://example.com"],
  ].map((returnTo) => ({ returnTo })))("falls back to home for an unsafe or unknown return path $returnTo", async ({ returnTo }) => {
    const { container } = render(await SignInPage({ searchParams: Promise.resolve({ returnTo }) }));
    expect(screen.getByRole("link", { name: "Back to Packetsecrets" })).toHaveAttribute("href", "/");
    expect(container.textContent).not.toContain("example.com");
  });

  it("honestly explains passwordless sign-in preparation without collecting credentials", async () => {
    const page = await SignInPage({ searchParams: Promise.resolve({}) });
    const { container } = render(page);
    expect(screen.getByRole("heading", { level: 1, name: "Sign in to Packetsecrets" })).toBeVisible();
    expect(screen.getByText(/Google and email passwordless sign-in is being prepared/)).toBeVisible();
    expect(container.querySelector("form, input, button")).toBeNull();
    const html = renderToStaticMarkup(page);
    expect(new DOMParser().parseFromString(html, "text/html").body.innerHTML).toBe(html);
  });
});
