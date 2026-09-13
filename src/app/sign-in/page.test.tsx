import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import SignInPage from "./page";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("sign-in page", () => {
  it("labels the dashboard return destination clearly", async () => {
    render(await SignInPage({ searchParams: Promise.resolve({ returnTo: "/dashboard" }) }));
    expect(screen.getByRole("link", { name: "Back to dashboard" })).toHaveAttribute("href", "/dashboard");
  });

  it.each([
    "/",
    "/dashboard",
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

  it("offers Google and email passwordless sign-in without collecting a password", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_AUTH_ENABLED", "true");
    const page = await SignInPage({ searchParams: Promise.resolve({}) });
    const { container } = render(page);
    expect(screen.getByRole("heading", { level: 1, name: "Sign in to Packetsecrets" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    expect(screen.getByLabelText("Email address")).toHaveAttribute("type", "email");
    expect(container.querySelector('input[type="password"]')).toBeNull();
    const html = renderToStaticMarkup(page);
    const parsed = new DOMParser().parseFromString(html, "text/html");
    expect(parsed.querySelector("main#main-content form")).not.toBeNull();
    expect(parsed.querySelector("parsererror")).toBeNull();
  });

  it("uses the dedicated responsive sign-in layout", async () => {
    const { container } = render(await SignInPage({ searchParams: Promise.resolve({}) }));
    expect(container.querySelector("main.sign-in-page")).not.toBeNull();
    expect(container.querySelector("section.sign-in-card")).not.toBeNull();
    expect(container.querySelector(".sign-in-card__trust")).toHaveTextContent("Passwordless");
  });

  it("shows a neutral callback error", async () => {
    render(await SignInPage({
      searchParams: Promise.resolve({ error: "authentication" }),
    }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your secure sign-in could not be completed. Please try again.",
    );
  });

  it("explains when a one-time link is expired and keeps the retry destination", async () => {
    render(await SignInPage({
      searchParams: Promise.resolve({
        error: "link_expired",
        returnTo: "/paths/networking-foundations",
      }),
    }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This sign-in link is invalid, expired, or was already used. Request a new link below.",
    );
    expect(screen.getByRole("link", { name: "Back to your pathway" }))
      .toHaveAttribute("href", "/paths/networking-foundations");
  });

  it("hides unavailable Google authentication while keeping email sign-in", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_AUTH_ENABLED", "false");
    render(await SignInPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
    expect(screen.getByLabelText("Email address")).toBeVisible();
  });
});
