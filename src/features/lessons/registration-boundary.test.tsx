import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { RegistrationBoundary } from "./registration-boundary";

afterEach(cleanup);

describe("RegistrationBoundary", () => {
  it("offers free continuation with the exact encoded canonical lesson path", () => {
    render(<RegistrationBoundary mode="save-progress" returnTo="/learn/networking-foundations/hosts-and-network-devices" />);
    expect(screen.getByRole("region", { name: "Save your progress" })).toHaveTextContent("Sign in to keep lesson completion and quiz results across devices. All lesson content remains free.");
    expect(screen.getByRole("link", { name: "Continue with Google or email" })).toHaveAttribute(
      "href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fhosts-and-network-devices",
    );
  });

  it("names multiple boundary instances with distinct heading IDs", () => {
    render(<>
      <RegistrationBoundary mode="save-progress" returnTo="/learn/networking-foundations/hosts-and-network-devices" />
      <RegistrationBoundary mode="save-progress" returnTo="/learn/networking-foundations/how-networks-communicate" />
    </>);
    const headings = screen.getAllByRole("heading", { name: "Save your progress" });
    expect(headings[0].id).not.toBe(headings[1].id);
    expect(screen.getAllByRole("region", { name: "Save your progress" })).toHaveLength(2);
  });

  it("describes the signed-in final assessment accurately", () => {
    render(<RegistrationBoundary mode="unlock-content" returnTo="/learn/networking-foundations/computer-network-basics-final-quiz" />);
    expect(screen.getByRole("region", { name: "Take the final quiz" })).toHaveTextContent("Sign in to take the remaining free assessment and save the result.");
  });

  it("server-renders paragraphs that survive HTML parsing without hydration repair", () => {
    const html = renderToStaticMarkup(<RegistrationBoundary mode="save-progress" returnTo="/" />);
    const parsed = new DOMParser().parseFromString(html, "text/html");
    expect(parsed.body.innerHTML).toBe(html);
    expect(parsed.querySelector("p p, p section, p div, p h2")).toBeNull();
  });
});
