import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => false,
  useReducedMotionState: () => ({ reducedMotion: false, isHydrated: true }),
}));
// Vitest does not compile MDX. Substitute only the content modules, retaining
// the real server access loader, lesson shell, and interactive player.
vi.mock("@/content/networking-foundations/how-networks-communicate.public.mdx", async () => {
  const { createElement, Fragment } = await import("react");
  const { NetworkCommunicationPacketFlow } = await import("@/features/packet-flow/packet-flow-experience");
  return {
    default: () => createElement(Fragment, null,
      createElement("p", null, "Public lesson explanation."),
      createElement("h2", { id: "packet-journey" }, "Interactive packet journey"),
      createElement(NetworkCommunicationPacketFlow),
    ),
  };
});
vi.mock("@/content/networking-foundations/how-networks-communicate.account.mdx", () => {
  throw new Error("ACCOUNT_ONLY_SENTINEL: anonymous route imported a protected body");
});

import * as contentRepository from "@/features/lessons/lesson-content.repository";

import * as lessonPage from "./page";

type StaticLessonPage = {
  dynamicParams?: boolean;
  generateStaticParams?: () => Array<{
    pathwaySlug: string;
    lessonSlug: string;
  }>;
};

const staticLessonPage = lessonPage as StaticLessonPage;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("lesson route generation", () => {
  it("renders usable public content before registration and excludes protected bodies", async () => {
    const loader = vi.spyOn(contentRepository, "loadAuthorizedLessonContent");
    const page = await lessonPage.default({
      params: Promise.resolve({
        pathwaySlug: "networking-foundations",
        lessonSlug: "how-networks-communicate",
      }),
    });
    const { container } = render(page);
    const boundary = screen.getByRole("region", { name: "Continue this lesson for free" });
    const introduction = screen.getByText("Public lesson explanation.");
    const playerNext = screen.getByRole("button", { name: "Next" });
    expect(introduction.compareDocumentPosition(boundary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(playerNext.compareDocumentPosition(boundary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(playerNext);
    expect(screen.getByText(/Step 2 of/)).toBeVisible();
    expect(boundary).toHaveTextContent("No payment required.");
    expect(screen.getByRole("link", { name: "Continue with Google or email" })).toHaveAttribute(
      "href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fhow-networks-communicate",
    );
    expect(loader).toHaveBeenCalledWith("networking-foundations/how-networks-communicate", "anonymous");
    expect(container.innerHTML).not.toMatch(/ACCOUNT_ONLY_SENTINEL|PRO_ONLY_SENTINEL/);
    expect(renderToStaticMarkup(page)).not.toMatch(/ACCOUNT_ONLY_SENTINEL|PRO_ONLY_SENTINEL/);
  });

  it("emits only published lessons from the validated catalogue", () => {
    expect(staticLessonPage.generateStaticParams?.()).toEqual([
      {
        pathwaySlug: "networking-foundations",
        lessonSlug: "how-networks-communicate",
      },
      {
        pathwaySlug: "networking-foundations",
        lessonSlug: "hosts-and-network-devices",
      },
      {
        pathwaySlug: "networking-foundations",
        lessonSlug: "osi-and-tcp-ip-models",
      },
    ]);
  });

  it("rejects lesson slugs outside the generated published catalogue", () => {
    expect(staticLessonPage.dynamicParams).toBe(false);
  });

  it("renders the complete pathway in the lesson shell", async () => {
    render(
      await lessonPage.default({
        params: Promise.resolve({
          pathwaySlug: "networking-foundations",
          lessonSlug: "how-networks-communicate",
        }),
      }),
    );

    expect(screen.getByRole("complementary", { name: "Course contents" })).toBeVisible();
    expect(screen.getAllByText("Networking Essentials")[0]).toBeVisible();
    expect(screen.getByText("Course contents", { selector: "summary" })).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: /how networks communicate/i })[0],
    ).toHaveAttribute("aria-current", "page");
  });
});
