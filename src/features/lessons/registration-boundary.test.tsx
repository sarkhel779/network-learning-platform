import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { RegistrationBoundary } from "./registration-boundary";

afterEach(cleanup);

describe("RegistrationBoundary", () => {
  it("offers free continuation with the exact encoded canonical lesson path", () => {
    render(<RegistrationBoundary returnTo="/learn/networking-foundations/hosts-and-network-devices" />);
    expect(screen.getByRole("region", { name: "Continue this lesson for free" })).toHaveTextContent("No payment required.");
    expect(screen.getByRole("link", { name: "Continue with Google or email" })).toHaveAttribute(
      "href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fhosts-and-network-devices",
    );
  });

  it("names multiple boundary instances with distinct heading IDs", () => {
    render(<>
      <RegistrationBoundary returnTo="/learn/networking-foundations/hosts-and-network-devices" />
      <RegistrationBoundary returnTo="/learn/networking-foundations/how-networks-communicate" />
    </>);
    const headings = screen.getAllByRole("heading", { name: "Continue this lesson for free" });
    expect(headings[0].id).not.toBe(headings[1].id);
    expect(screen.getAllByRole("region", { name: "Continue this lesson for free" })).toHaveLength(2);
  });

  it("server-renders paragraphs that survive HTML parsing without hydration repair", () => {
    const html = renderToStaticMarkup(<RegistrationBoundary returnTo="/" />);
    const parsed = new DOMParser().parseFromString(html, "text/html");
    expect(parsed.body.innerHTML).toBe(html);
    expect(parsed.querySelector("p p, p section, p div, p h2")).toBeNull();
  });
});
