import { describe, expect, it } from "vitest";

import {
  getAdjacentLessons,
  getLesson,
  getPathway,
  listPublishedLessons,
} from "./catalog.repository";

describe("catalog repository", () => {
  const approvedCurriculum = [
    {
      title: "Network and Device Essentials",
      lessons: [
        "What Is a Computer Network?",
        "Hosts, Clients, Servers and Network Interfaces",
        "Cables, Fibre, Wireless and Network Connections",
        "Hubs, Bridges and Switches",
        "Routers, Default Gateways and Network Boundaries",
        "Access Points, Modems, ONTs and Firewalls",
        "OSI and TCP/IP Models",
        "A Packet’s First Journey Through a Small Network",
      ],
    },
    {
      title: "Ethernet, Switching and Local Networks",
      lessons: [
        "Ethernet Frames and MAC Addresses",
        "How Switches Learn and Forward",
        "ARP and Local Delivery",
        "VLANs, Access Ports and Trunks",
      ],
    },
    {
      title: "IP Addressing and Routing",
      lessons: [
        "IPv4 Addressing",
        "Subnetting Fundamentals",
        "IPv6 Fundamentals",
        "Routing, Routing Tables and Default Routes",
        "ICMP, Ping and Path Discovery",
      ],
    },
    {
      title: "Transport and Application Services",
      lessons: [
        "TCP, UDP and Ports",
        "DHCP and Automatic Address Configuration",
        "DNS and Name Resolution",
        "HTTP, HTTPS, TLS and Essential Network Services",
      ],
    },
    {
      title: "NAT and Internet Communication",
      lessons: ["NAT, PAT and the Complete Internet Packet Journey"],
    },
    {
      title: "Packet Analysis and Troubleshooting",
      lessons: ["Systematic Network Troubleshooting Capstone"],
    },
  ] as const;

  it("matches the approved launch curriculum", () => {
    const pathway = getPathway("networking-foundations");

    expect(pathway.modules.map(({ title, lessons }) => ({
      title,
      lessons: lessons.map((lesson) => lesson.title),
    }))).toEqual(approvedCurriculum);
    expect(pathway.modules.flatMap(({ lessons }) => lessons)).toHaveLength(23);
  });

  it("preserves implemented routes and removes security lessons", () => {
    const pathway = getPathway("networking-foundations");
    const lessons = pathway.modules.flatMap(({ lessons }) => lessons);

    expect(listPublishedLessons(pathway.slug).map(({ slug }) => slug).sort()).toEqual([
      "cables-fibre-wireless-and-network-connections",
      "hosts-and-network-devices",
      "how-networks-communicate",
      "hubs-bridges-and-switches",
      "osi-and-tcp-ip-models",
    ]);
    expect(getLesson(pathway.slug, "how-networks-communicate").title)
      .toBe("What Is a Computer Network?");
    expect(getLesson(pathway.slug, "hosts-and-network-devices").title)
      .toBe("Hosts, Clients, Servers and Network Interfaces");
    expect(getLesson(pathway.slug, "osi-and-tcp-ip-models").title)
      .toBe("OSI and TCP/IP Models");
    expect(lessons.map(({ title }) => title).join(" ")).not.toMatch(
      /Firewall Fundamentals|Palo Alto|IPsec|VPN/i,
    );
  });

  it("publishes connection media with its approved order and access sections", () => {
    const pathwaySlug = "networking-foundations";
    const lessonSlug = "cables-fibre-wireless-and-network-connections";

    expect(listPublishedLessons(pathwaySlug).map(({ slug }) => slug)).toEqual([
      "how-networks-communicate",
      "hosts-and-network-devices",
      "cables-fibre-wireless-and-network-connections",
      "hubs-bridges-and-switches",
      "osi-and-tcp-ip-models",
    ]);
    expect(getLesson(pathwaySlug, lessonSlug)).toMatchObject({
      title: "Cables, Fibre, Wireless and Network Connections",
      objective: "Choose an appropriate connection medium and explain duplex, speed, signal, and link state at a beginner level.",
      seo: {
        title: "Network Cables, Fibre and Wireless Basics",
        description: "Compare copper, fibre, and wireless links to choose suitable connections and recognize beginner-friendly link symptoms.",
      },
      estimatedMinutes: 20,
      published: true,
    });
    expect(getLesson(pathwaySlug, lessonSlug).sections).toEqual([
      { id: "how-connections-carry-data", label: "How connections carry data", access: "public" },
      { id: "connection-qualities", label: "Connection qualities", access: "public" },
      { id: "copper-ethernet", label: "Copper Ethernet", access: "public" },
      { id: "fibre-connections", label: "Fibre connections", access: "public" },
      { id: "wireless-connections", label: "Wireless connections", access: "public" },
      { id: "compare-media", label: "Compare connection media", access: "public" },
      { id: "design-a-connection", label: "Design a connection", access: "account" },
      { id: "diagnose-link-symptoms", label: "Diagnose link symptoms", access: "account" },
      { id: "knowledge-check-summary", label: "Knowledge check and summary", access: "account" },
      { id: "pro-deep-dive", label: "Pro Deep Dive", access: "pro", preview: "Explore optical budgets, wireless channel analysis, advanced troubleshooting, standards checks, and interview preparation." },
    ]);
  });

  it("publishes hubs, bridges and switches with its approved access contract", () => {
    const pathwaySlug = "networking-foundations";
    const lessonSlug = "hubs-bridges-and-switches";

    expect(getLesson(pathwaySlug, lessonSlug)).toMatchObject({
      title: "Hubs, Bridges and Switches",
      objective: "Explain why hubs repeat signals while bridges and switches make link-layer forwarding decisions.",
      seo: {
        title: "Hubs, Bridges and Switches Explained",
        description: "See how hubs repeat traffic while bridges and switches make selective link-layer forwarding choices on a local network.",
      },
      estimatedMinutes: 20,
      published: true,
    });
    expect(getLesson(pathwaySlug, lessonSlug).sections).toEqual([
      { id: "one-local-ethernet-conversation", label: "One local Ethernet conversation", access: "public" },
      { id: "what-a-hub-does", label: "What a hub does", access: "public" },
      { id: "why-bridges-changed-ethernet", label: "Why bridges changed Ethernet", access: "public" },
      { id: "how-a-switch-learns", label: "How a switch learns", access: "public" },
      { id: "how-a-switch-forwards", label: "How a switch forwards", access: "public" },
      { id: "compare-hub-bridge-switch", label: "Compare hub, bridge and switch", access: "public" },
      { id: "forward-the-frame", label: "Forward the frame", access: "account" },
      { id: "diagnose-local-switching-symptoms", label: "Diagnose local switching symptoms", access: "account" },
      { id: "knowledge-check-summary", label: "Knowledge check and summary", access: "account" },
      { id: "pro-deep-dive", label: "Pro Deep Dive", access: "pro", preview: "Discover future advanced switching practice and career preparation." },
    ]);
    expect(getAdjacentLessons(pathwaySlug, lessonSlug)).toMatchObject({
      previous: { slug: "cables-fibre-wireless-and-network-connections" },
      next: { slug: "routers-default-gateways-and-network-boundaries", published: false },
    });
  });

  it("keeps only the first four lesson foundations public", () => {
    const lessons = getPathway("networking-foundations").modules
      .flatMap(({ lessons: moduleLessons }) => moduleLessons);
    const [first, second, connectionMedia, switching, osi] = [lessons[0], lessons[1], lessons[2], lessons[3], lessons[6]];

    expect(first.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(second.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(connectionMedia.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(switching.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(
      lessons.slice(4).some(({ sections }) =>
        sections?.some(({ access }) => access === "public"),
      ),
    ).toBe(false);
    for (const lesson of [first, second, connectionMedia, switching, osi]) {
      expect(lesson.sections?.at(-1)).toEqual(expect.objectContaining({
        id: "pro-deep-dive",
        label: "Pro Deep Dive",
        access: "pro",
        preview: expect.stringMatching(/\S/),
      }));
    }
  });

  it("derives adjacency across the approved curriculum", () => {
    expect(getAdjacentLessons("networking-foundations", "how-networks-communicate").previous)
      .toBeUndefined();
    expect(getAdjacentLessons("networking-foundations", "how-networks-communicate").next?.slug)
      .toBe("hosts-and-network-devices");
    expect(getAdjacentLessons("networking-foundations", "hosts-and-network-devices").next?.slug)
      .toBe("cables-fibre-wireless-and-network-connections");
    const connectionMedia = getAdjacentLessons(
      "networking-foundations",
      "cables-fibre-wireless-and-network-connections",
    );
    expect(connectionMedia.previous?.slug).toBe("hosts-and-network-devices");
    expect(connectionMedia.next?.slug).toBe("hubs-bridges-and-switches");
    expect(getAdjacentLessons("networking-foundations", "osi-and-tcp-ip-models").previous?.slug)
      .toBe("access-points-modems-onts-and-firewalls");
    expect(getAdjacentLessons("networking-foundations", "systematic-network-troubleshooting-capstone").next)
      .toBeUndefined();
  });

  it("throws the documented error for an unknown lesson", () => {
    expect(() => getLesson("networking-foundations", "missing")).toThrowError(
      "LESSON_NOT_FOUND",
    );
  });

  it("throws the documented error for an unknown pathway", () => {
    expect(() => getPathway("missing")).toThrowError("PATHWAY_NOT_FOUND");
  });
});
