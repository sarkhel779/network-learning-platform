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
vi.mock("@/content/networking-foundations/cables-fibre-wireless-and-network-connections.public.mdx", async () => {
  const { createElement, Fragment } = await import("react");
  return {
    default: () => createElement(Fragment, null,
      createElement("p", null, "Public connection media comparison."),
      createElement("h2", { id: "compare-media" }, "Compare connection media"),
    ),
  };
});
vi.mock("@/content/networking-foundations/cables-fibre-wireless-and-network-connections.account.mdx", () => {
  throw new Error("CONNECTION_MEDIA_ACCOUNT_SENTINEL: anonymous route imported a protected body");
});
vi.mock("@/content/networking-foundations/hubs-bridges-and-switches.public.mdx", async () => {
  const { createElement, Fragment } = await import("react");
  return {
    default: () => createElement(Fragment, null,
      createElement("p", null, "Public switching comparison."),
      createElement("h2", { id: "compare-hub-bridge-switch" }, "Compare hub, bridge and switch"),
    ),
  };
});
vi.mock("@/content/networking-foundations/hubs-bridges-and-switches.account.mdx", () => {
  throw new Error("SWITCHING_ACCOUNT_SENTINEL: anonymous route imported a protected body");
});
vi.mock("@/content/networking-foundations/osi-and-tcp-ip-models.account.mdx", () => {
  throw new Error("OSI_ACCOUNT_SENTINEL: anonymous route imported a protected body");
});

import * as contentRepository from "@/features/lessons/lesson-content.repository";
import { listPublishedLessons } from "@/features/catalog/catalog.repository";

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
  it("provides unique catalog SEO and a relative canonical for each published lesson", async () => {
    const metadata = await Promise.all(listPublishedLessons("networking-foundations").map((lesson) =>
      lessonPage.generateMetadata({ params: Promise.resolve({ pathwaySlug: "networking-foundations", lessonSlug: lesson.slug }) }),
    ));
    expect(metadata[0]).toEqual({
      title: "How Networks Communicate: A Beginner's Guide",
      description: "Learn the decisions that move data between hosts and trace a packet across a network.",
      alternates: { canonical: "/learn/networking-foundations/how-networks-communicate" },
      openGraph: {
        type: "article",
        url: "/learn/networking-foundations/how-networks-communicate",
        title: "How Networks Communicate: A Beginner's Guide",
        description: "Learn the decisions that move data between hosts and trace a packet across a network.",
      },
    });
    expect(new Set(metadata.map(({ title }) => title)).size).toBe(metadata.length);
    expect(new Set(metadata.map(({ description }) => description)).size).toBe(metadata.length);
  });

  it.each([
    ["missing", "how-networks-communicate"],
    ["networking-foundations", "missing"],
    ["networking-foundations", "arp-and-local-delivery"],
  ])("keeps metadata and content not-found for %s/%s", async (pathwaySlug, lessonSlug) => {
    const props = { params: Promise.resolve({ pathwaySlug, lessonSlug }) };
    await expect(lessonPage.generateMetadata(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(lessonPage.default(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("server-renders one parseable JSON-LD resource with safe access flags", async () => {
    const { container } = render(await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations", lessonSlug: "how-networks-communicate",
    }) }));
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    const data = JSON.parse(scripts[0].textContent ?? "");
    expect(data.url).toBe("https://packetsecrets.com/learn/networking-foundations/how-networks-communicate");
    expect(data.hasPart.map((part: { isAccessibleForFree: boolean }) => part.isAccessibleForFree)).toEqual([true, true, false, false, false, false]);
  });

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
        lessonSlug: "cables-fibre-wireless-and-network-connections",
      },
      {
        pathwaySlug: "networking-foundations",
        lessonSlug: "hubs-bridges-and-switches",
      },
      {
        pathwaySlug: "networking-foundations",
        lessonSlug: "osi-and-tcp-ip-models",
      },
    ]);
  });

  it("renders only the switching public body for anonymous visitors", async () => {
    const loader = vi.spyOn(contentRepository, "loadAuthorizedLessonContent");
    const page = await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations",
      lessonSlug: "hubs-bridges-and-switches",
    }) });
    const { container } = render(page);

    expect(screen.getByText("Public switching comparison.")).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "Compare hub, bridge and switch" })).toBeVisible();
    expect(loader).toHaveBeenCalledWith("networking-foundations/hubs-bridges-and-switches", "anonymous");
    expect(container.innerHTML).not.toContain("SWITCHING_ACCOUNT_SENTINEL");
    expect(renderToStaticMarkup(page)).not.toContain("SWITCHING_ACCOUNT_SENTINEL");
  });

  it("renders only the connection-media public body for anonymous visitors", async () => {
    const loader = vi.spyOn(contentRepository, "loadAuthorizedLessonContent");
    const page = await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations",
      lessonSlug: "cables-fibre-wireless-and-network-connections",
    }) });
    const { container } = render(page);

    expect(screen.getByText("Public connection media comparison.")).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "Compare connection media" })).toBeVisible();
    expect(loader).toHaveBeenCalledWith(
      "networking-foundations/cables-fibre-wireless-and-network-connections",
      "anonymous",
    );
    expect(container.innerHTML).not.toContain("CONNECTION_MEDIA_ACCOUNT_SENTINEL");
    expect(renderToStaticMarkup(page)).not.toContain("CONNECTION_MEDIA_ACCOUNT_SENTINEL");
  });

  it("renders the OSI account boundary without loading or serializing its foundations", async () => {
    const page = await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations", lessonSlug: "osi-and-tcp-ip-models",
    }) });
    const { container } = render(page);
    expect(screen.getByRole("heading", { level: 1, name: "OSI and TCP/IP Models" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Continue with Google or email" })).toHaveAttribute(
      "href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fosi-and-tcp-ip-models",
    );
    expect(container.querySelector(".lesson-content")).toBeEmptyDOMElement();
    expect(container.querySelector(".lesson-byline")).not.toHaveTextContent("Public introduction");
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(renderToStaticMarkup(page)).not.toMatch(/OSI_FOUNDATIONS_SENTINEL|OSI_ACCOUNT_SENTINEL/);
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
    expect(screen.getAllByText("Network and Device Essentials")[0]).toBeVisible();
    expect(screen.getByText("Course contents", { selector: "summary" })).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: /what is a computer network/i })[0],
    ).toHaveAttribute("aria-current", "page");
  });
});
