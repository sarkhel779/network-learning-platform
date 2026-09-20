import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getViewer, listPathwayProgress, loadContentOverridesSnapshot, permanentRedirect } = vi.hoisted(() => ({
  getViewer: vi.fn(),
  listPathwayProgress: vi.fn(),
  loadContentOverridesSnapshot: vi.fn(),
  permanentRedirect: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT;${destination}`);
  }),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  permanentRedirect,
}));
vi.mock("@/lib/supabase/session", () => ({ getViewer }));
vi.mock("@/features/progress/progress.repository", () => ({ listPathwayProgress }));
vi.mock("@/features/catalog/content-publication.repository", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/catalog/content-publication.repository")>()),
  loadContentOverridesSnapshot,
}));
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
vi.mock("@/content/networking-foundations/how-networks-communicate.account.mdx", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("p", null, "Authenticated lesson explanation.") };
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
vi.mock("@/content/networking-foundations/unicast-broadcast-and-multicast-communication.public.mdx", async () => {
  const { createElement, Fragment } = await import("react");
  return {
    default: () => createElement(Fragment, null,
      createElement("p", null, "Public delivery-scope explanation."),
      createElement("h2", { id: "delivery-scope-player" }, "Interactive delivery-scope player"),
    ),
  };
});
vi.mock("@/content/networking-foundations/unicast-broadcast-and-multicast-communication.account.mdx", () => {
  throw new Error("DELIVERY_SCOPE_ACCOUNT_SENTINEL: anonymous route imported a protected body");
});
vi.mock("@/content/networking-foundations/routers-default-gateways-and-network-boundaries.public.mdx", async () => {
  const { createElement, Fragment } = await import("react");
  return { default: () => createElement(Fragment, null,
    createElement("p", null, "Public route-decision explanation."),
    createElement("h2", { id: "route-decision-player" }, "Interactive route-decision player"),
  ) };
});
vi.mock("@/content/networking-foundations/routers-default-gateways-and-network-boundaries.account.mdx", () => {
  throw new Error("ROUTE_DECISION_ACCOUNT_SENTINEL: anonymous route imported a protected body");
});
vi.mock("@/content/networking-foundations/access-points-modems-onts-and-firewalls.public.mdx", async () => {
  const { createElement, Fragment } = await import("react");
  return { default: () => createElement(Fragment, null,
    createElement("p", null, "Public edge-device explanation."),
    createElement("h2", { id: "interactive-edge-journey" }, "Interactive edge-device journey"),
  ) };
});
vi.mock("@/content/networking-foundations/access-points-modems-onts-and-firewalls.account.mdx", () => {
  throw new Error("EDGE_DEVICE_ACCOUNT_SENTINEL: anonymous route imported a protected body");
});
vi.mock("@/content/networking-foundations/osi-and-tcp-ip-models.public.mdx", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("p", null, "Public layered-model foundations.") };
});
vi.mock("@/content/networking-foundations/osi-and-tcp-ip-models.account.mdx", () => {
  throw new Error("OSI_ACCOUNT_SENTINEL: anonymous route imported a protected body");
});
vi.mock("@/content/networking-foundations/dhcp-and-automatic-address-configuration.public.mdx", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("p", null, "Public DHCP packet journey.") };
});
vi.mock("@/content/networking-foundations/dhcp-and-automatic-address-configuration.account.mdx", () => {
  throw new Error("DHCP_ACCOUNT_SENTINEL: anonymous route imported a protected body");
});
vi.mock("@/content/networking-foundations/dhcp-and-automatic-address-configuration.pro.mdx", () => {
  throw new Error("DHCP_PRO_SENTINEL: anonymous route imported a protected body");
});
vi.mock("@/content/networking-foundations/dns-and-name-resolution.public.mdx", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("p", null, "Public DNS resolution journey.") };
});
vi.mock("@/content/networking-foundations/dns-and-name-resolution.account.mdx", () => {
  throw new Error("DNS_ACCOUNT_SENTINEL: anonymous route imported a protected body");
});
vi.mock("@/content/networking-foundations/dns-and-name-resolution.pro.mdx", () => {
  throw new Error("DNS_PRO_SENTINEL: anonymous route imported a protected body");
});
vi.mock("@/content/networking-foundations/systematic-network-troubleshooting-capstone.public.mdx", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("p", null, "Public troubleshooting method.") };
});
vi.mock("@/content/networking-foundations/systematic-network-troubleshooting-capstone.account.mdx", () => {
  throw new Error("CAPSTONE_ACCOUNT_SENTINEL: anonymous route imported a protected body");
});
vi.mock("@/content/networking-foundations/systematic-network-troubleshooting-capstone.pro.mdx", () => {
  throw new Error("CAPSTONE_PRO_SENTINEL: anonymous route imported a protected body");
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

beforeEach(() => {
  permanentRedirect.mockClear();
  getViewer.mockResolvedValue(null);
  listPathwayProgress.mockResolvedValue([]);
  loadContentOverridesSnapshot.mockResolvedValue({ publications: {}, orders: {} });
});

describe("lesson route generation", () => {
  it("permanently redirects the retired combined lesson to Hubs before lookup", async () => {
    await expect(lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations",
      lessonSlug: "hubs-bridges-and-switches",
    }) })).rejects.toThrow("NEXT_REDIRECT;/learn/networking-foundations/hubs");
    expect(permanentRedirect).toHaveBeenCalledWith("/learn/networking-foundations/hubs");
    expect(loadContentOverridesSnapshot).not.toHaveBeenCalled();
  });

  it("provides unique catalog SEO and a relative canonical for each published lesson", async () => {
    const metadata = await Promise.all(listPublishedLessons("networking-foundations").map((lesson) =>
      lessonPage.generateMetadata({ params: Promise.resolve({ pathwaySlug: "networking-foundations", lessonSlug: lesson.slug }) }),
    ));
    expect(metadata[0]).toEqual({
      title: "Computer Networks and Network Devices",
      description: "Learn what computer networks are, why they exist, and the broad roles of common network devices.",
      alternates: { canonical: "/learn/networking-foundations/how-networks-communicate" },
      openGraph: {
        type: "article",
        url: "/learn/networking-foundations/how-networks-communicate",
        title: "Computer Networks and Network Devices",
        description: "Learn what computer networks are, why they exist, and the broad roles of common network devices.",
      },
    });
    expect(new Set(metadata.map(({ title }) => title)).size).toBe(metadata.length);
    expect(new Set(metadata.map(({ description }) => description)).size).toBe(metadata.length);
  });

  it.each([
    ["missing", "how-networks-communicate"],
    ["networking-foundations", "missing"],
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
    expect(data.hasPart.map((part: { isAccessibleForFree: boolean }) => part.isAccessibleForFree)).toEqual([true, true, true, true, true, true]);
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
    const boundary = screen.getByRole("region", { name: "Save your progress" });
    const introduction = screen.getByText("Public lesson explanation.");
    const playerNext = screen.getByRole("button", { name: "Next" });
    expect(introduction.compareDocumentPosition(boundary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(playerNext.compareDocumentPosition(boundary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(playerNext);
    expect(screen.getByText(/Step 2 of/)).toBeVisible();
    expect(boundary).toHaveTextContent("Sign in to keep lesson completion and quiz results across devices. All lesson content remains free.");
    expect(screen.getByRole("link", { name: "Continue with Google or email" })).toHaveAttribute(
      "href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fhow-networks-communicate",
    );
    expect(loader).toHaveBeenCalledWith("networking-foundations/how-networks-communicate", "anonymous");
    expect(container.innerHTML).not.toMatch(/ACCOUNT_ONLY_SENTINEL|PRO_ONLY_SENTINEL/);
    expect(renderToStaticMarkup(page)).not.toMatch(/ACCOUNT_ONLY_SENTINEL|PRO_ONLY_SENTINEL/);
  });

  it("does not honor an audit query outside local development", async () => {
    const loader = vi.spyOn(contentRepository, "loadAuthorizedLessonContent");
    const page = await lessonPage.default({
      params: Promise.resolve({ pathwaySlug: "networking-foundations", lessonSlug: "how-networks-communicate" }),
      searchParams: Promise.resolve({ audit: "1" }),
    });
    render(page);
    expect(loader).toHaveBeenCalledWith("networking-foundations/how-networks-communicate", "anonymous");
    expect(screen.getByRole("region", { name: "Save your progress" })).toBeVisible();
    expect(screen.queryByText(/Local audit preview/)).not.toBeInTheDocument();
  });

  it("renders the complete public lesson for an authenticated learner and loads progress", async () => {
    getViewer.mockResolvedValue({ id: "learner-1", displayName: "Pranita", avatarUrl: null });
    listPathwayProgress.mockResolvedValue([{
      attemptId: "attempt-1", pathwayId: "path_networking_foundations",
      lessonId: "lesson_how_networks_communicate", contentVersion: 1,
      attemptNumber: 1, status: "in_progress", completedItemIds: [],
      nextItemId: "how_networks_communicate_check_1",
      lastItemId: null, lastAnchor: null, completionPercent: 20,
      incorrectCheckCount: 0, updatedAt: "2026-09-09T00:00:00Z",
    }]);
    const loader = vi.spyOn(contentRepository, "loadAuthorizedLessonContent");
    const { container } = render(await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations", lessonSlug: "how-networks-communicate",
    }) }));

    expect(loader).toHaveBeenCalledWith("networking-foundations/how-networks-communicate", "account");
    expect(screen.getByText("Public lesson explanation.")).toBeVisible();
    expect(screen.queryByText("Authenticated lesson explanation.")).not.toBeInTheDocument();
    expect(listPathwayProgress).toHaveBeenCalledWith(
      "learner-1", "path_networking_foundations",
    );
    expect(container.querySelector("article")).toHaveAttribute("data-progress-attempt", "attempt-1");
    expect(screen.queryByRole("region", { name: "Save your progress" })).not.toBeInTheDocument();
  });

  it("keeps authenticated lesson content visible when progress loading is unavailable", async () => {
    getViewer.mockResolvedValue({ id: "learner-1", displayName: "Pranita", avatarUrl: null });
    listPathwayProgress.mockRejectedValue(new Error("provider detail"));
    const { container } = render(await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations", lessonSlug: "how-networks-communicate",
    }) }));
    expect(screen.getByText("Public lesson explanation.")).toBeVisible();
    expect(container.querySelector("article")).toHaveAttribute("data-progress-unavailable", "true");
    expect(container.innerHTML).not.toContain("provider detail");
  });

  it("emits only published lessons from the validated catalogue", () => {
    expect(staticLessonPage.generateStaticParams?.()).toEqual(
      listPublishedLessons("networking-foundations").map(({ slug: lessonSlug }) => ({
        pathwaySlug: "networking-foundations",
        lessonSlug,
      })),
    );
    expect(staticLessonPage.generateStaticParams?.()).not.toContainEqual({
      pathwaySlug: "networking-foundations",
      lessonSlug: "hubs-bridges-and-switches",
    });
  });

  it("renders the capstone public method without protected blocks for anonymous visitors", async () => {
    const loader = vi.spyOn(contentRepository, "loadAuthorizedLessonContent");
    const page = await lessonPage.default({ params: Promise.resolve({ pathwaySlug: "networking-foundations", lessonSlug: "systematic-network-troubleshooting-capstone" }) });
    const { container } = render(page);
    expect(screen.getByRole("heading", { level: 1, name: "Systematic Network Troubleshooting Capstone" })).toBeVisible();
    expect(screen.getByText("Public troubleshooting method.")).toBeVisible();
    expect(loader).toHaveBeenCalledWith("networking-foundations/systematic-network-troubleshooting-capstone", "anonymous");
    expect(container.innerHTML).not.toMatch(/CAPSTONE_(?:ACCOUNT|PRO)_SENTINEL/);
  });

  it("renders the canonical DHCP route without protected blocks for anonymous visitors", async () => {
    const loader = vi.spyOn(contentRepository, "loadAuthorizedLessonContent");
    const page = await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations", lessonSlug: "dhcp-and-automatic-address-configuration",
    }) });
    const { container } = render(page);
    expect(screen.getByRole("heading", { level: 1, name: "DHCP and Automatic Address Configuration" })).toBeVisible();
    expect(screen.getByText("Public DHCP packet journey.")).toBeVisible();
    expect(loader).toHaveBeenCalledWith("networking-foundations/dhcp-and-automatic-address-configuration", "anonymous");
    expect(container.innerHTML).not.toMatch(/DHCP_(?:ACCOUNT|PRO)_SENTINEL/);
  });

  it("renders the canonical DNS route without protected blocks for anonymous visitors", async () => {
    const loader = vi.spyOn(contentRepository, "loadAuthorizedLessonContent");
    const page = await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations", lessonSlug: "dns-and-name-resolution",
    }) });
    const { container } = render(page);
    expect(screen.getByRole("heading", { level: 1, name: "DNS and Name Resolution" })).toBeVisible();
    expect(screen.getByText("Public DNS resolution journey.")).toBeVisible();
    expect(loader).toHaveBeenCalledWith("networking-foundations/dns-and-name-resolution", "anonymous");
    expect(container.innerHTML).not.toMatch(/DNS_(?:ACCOUNT|PRO)_SENTINEL/);
  });

  it("renders only the edge-device public body for anonymous visitors", async () => {
    const loader = vi.spyOn(contentRepository, "loadAuthorizedLessonContent");
    const page = await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations",
      lessonSlug: "access-points-modems-onts-and-firewalls",
    }) });
    const { container } = render(page);

    expect(screen.getByText("Public edge-device explanation.")).toBeVisible();
    expect(loader).toHaveBeenCalledWith(
      "networking-foundations/access-points-modems-onts-and-firewalls",
      "anonymous",
    );
    expect(container.innerHTML).not.toContain("EDGE_DEVICE_ACCOUNT_SENTINEL");
  });

  it("renders only the delivery-scope public body for anonymous visitors", async () => {
    const loader = vi.spyOn(contentRepository, "loadAuthorizedLessonContent");
    const page = await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations",
      lessonSlug: "unicast-broadcast-and-multicast-communication",
    }) });
    const { container } = render(page);

    expect(screen.getByText("Public delivery-scope explanation.")).toBeVisible();
    expect(loader).toHaveBeenCalledWith(
      "networking-foundations/unicast-broadcast-and-multicast-communication",
      "anonymous",
    );
    expect(container.innerHTML).not.toContain("DELIVERY_SCOPE_ACCOUNT_SENTINEL");
  });

  it("renders only the route-decision public body for anonymous visitors", async () => {
    const loader = vi.spyOn(contentRepository, "loadAuthorizedLessonContent");
    const page = await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations",
      lessonSlug: "routers-default-gateways-and-network-boundaries",
    }) });
    const { container } = render(page);

    expect(screen.getByText("Public route-decision explanation.")).toBeVisible();
    expect(loader).toHaveBeenCalledWith(
      "networking-foundations/routers-default-gateways-and-network-boundaries",
      "anonymous",
    );
    expect(container.innerHTML).not.toContain("ROUTE_DECISION_ACCOUNT_SENTINEL");
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

  it("renders the public OSI foundations and offers optional progress saving", async () => {
    const page = await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations", lessonSlug: "osi-and-tcp-ip-models",
    }) });
    const { container } = render(page);
    expect(screen.getByRole("heading", { level: 1, name: "OSI and TCP/IP Models" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Save your progress" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Continue with Google or email" })).toHaveAttribute(
      "href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fosi-and-tcp-ip-models",
    );
    expect(container.querySelector(".lesson-content")).not.toBeEmptyDOMElement();
    expect(container.querySelector(".lesson-byline")).toHaveTextContent("Free");
    expect(renderToStaticMarkup(page)).not.toMatch(/OSI_FOUNDATIONS_SENTINEL|OSI_ACCOUNT_SENTINEL/);
  });

  it("renders lesson slugs outside the generated published catalogue on demand instead of 404ing so publish toggles take effect live", () => {
    expect(staticLessonPage.dynamicParams).toBe(true);
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

    const trigger = screen.getByRole("button", { name: "Course contents" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Course contents" })).toBeVisible();
    expect(screen.getByText("Computer Network Basics")).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: /introduction to computer networks and network devices/i })[0],
    ).toHaveAttribute("aria-current", "page");
  });

  it("hides a lesson unpublished by a live database override", async () => {
    loadContentOverridesSnapshot.mockResolvedValue({
      publications: { lesson_how_networks_communicate: false },
      orders: {},
    });
    const props = { params: Promise.resolve({
      pathwaySlug: "networking-foundations", lessonSlug: "how-networks-communicate",
    }) };
    await expect(lessonPage.generateMetadata(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(lessonPage.default(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("honors a live database reorder for previous/next navigation", async () => {
    loadContentOverridesSnapshot.mockResolvedValue({
      publications: {},
      orders: { module_network_and_device_essentials: [
        "lesson_hosts_and_network_devices",
        "lesson_how_networks_communicate",
        "lesson_hubs",
        "lesson_bridges",
        "lesson_switches",
        "lesson_routers_default_gateways_and_network_boundaries",
        "lesson_physical_and_logical_addressing",
        "lesson_osi_and_tcp_ip_models",
        "lesson_computer_network_basics_final_quiz",
      ] },
    });
    render(await lessonPage.default({ params: Promise.resolve({
      pathwaySlug: "networking-foundations", lessonSlug: "how-networks-communicate",
    }) }));
    expect(screen.getByRole("link", { name: "Previous: Hosts, Clients and Servers" })).toBeVisible();
  });
});
