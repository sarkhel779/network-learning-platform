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
        "Unicast, Broadcast and Multicast Communication",
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
    expect(pathway.modules.flatMap(({ lessons }) => lessons)).toHaveLength(24);
  });

  it("preserves implemented routes and removes security lessons", () => {
    const pathway = getPathway("networking-foundations");
    const lessons = pathway.modules.flatMap(({ lessons }) => lessons);

    expect(listPublishedLessons(pathway.slug).map(({ slug }) => slug).sort()).toEqual([
      "access-points-modems-onts-and-firewalls",
      "arp-and-local-delivery",
      "cables-fibre-wireless-and-network-connections",
      "ethernet-frames-and-mac-addresses",
      "first-packet-journey-through-a-small-network",
      "hosts-and-network-devices",
      "how-networks-communicate",
      "how-switches-learn-and-forward",
      "hubs-bridges-and-switches",
      "ipv4-addressing",
      "ipv6-fundamentals",
      "osi-and-tcp-ip-models",
      "routers-default-gateways-and-network-boundaries",
      "subnetting-fundamentals",
      "unicast-broadcast-and-multicast-communication",
      "vlans-access-ports-and-trunks",
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

  it("publishes Ethernet frames after the packet-journey capstone with progressive access", () => {
    const lesson = getLesson("networking-foundations", "ethernet-frames-and-mac-addresses");

    expect(lesson).toMatchObject({
      title: "Ethernet Frames and MAC Addresses",
      estimatedMinutes: 24,
      published: true,
    });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["ethernet-delivers-on-the-local-link", "public"],
      ["read-an-ethernet-frame", "public"],
      ["understand-mac-addresses", "public"],
      ["delivery-addresses", "public"],
      ["interactive-frame-delivery", "public"],
      ["inspect-frame-evidence", "account"],
      ["diagnose-frame-problems", "account"],
      ["knowledge-check-summary", "account"],
      ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "first-packet-journey-through-a-small-network", published: true },
      next: { slug: "how-switches-learn-and-forward", published: true },
    });
  });

  it("publishes switch learning after Ethernet frames with progressive access", () => {
    const lesson = getLesson("networking-foundations", "how-switches-learn-and-forward");

    expect(lesson).toMatchObject({
      title: "How Switches Learn and Forward",
      estimatedMinutes: 24,
      published: true,
    });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["the-switch-decision-cycle", "public"],
      ["learn-the-source-address", "public"],
      ["look-up-the-destination", "public"],
      ["forward-filter-or-flood", "public"],
      ["interactive-switch-learning", "public"],
      ["read-mac-table-evidence", "account"],
      ["diagnose-switching-behaviour", "account"],
      ["knowledge-check-summary", "account"],
      ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "ethernet-frames-and-mac-addresses", published: true },
      next: { slug: "arp-and-local-delivery", published: true },
    });
  });

  it("publishes ARP after switch learning with progressive access", () => {
    const lesson = getLesson("networking-foundations", "arp-and-local-delivery");

    expect(lesson).toMatchObject({
      title: "ARP and Local Delivery",
      objective: "Explain how IPv4 nodes resolve a local next-hop IP address to a MAC address.",
      estimatedMinutes: 24,
      published: true,
    });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["why-arp-exists", "public"],
      ["choose-the-next-hop-first", "public"],
      ["request-reply-and-cache", "public"],
      ["interactive-arp-journey", "public"],
      ["arp-variants-and-boundaries", "public"],
      ["inspect-neighbour-evidence", "account"],
      ["troubleshoot-arp-methodically", "account"],
      ["knowledge-check-summary", "account"],
      ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "how-switches-learn-and-forward", published: true },
      next: { slug: "vlans-access-ports-and-trunks", published: true },
    });
  });

  it("publishes VLANs after ARP with progressive access", () => {
    const lesson = getLesson("networking-foundations", "vlans-access-ports-and-trunks");

    expect(lesson).toMatchObject({ estimatedMinutes: 24, published: true });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["why-vlans-exist", "public"],
      ["access-ports-and-membership", "public"],
      ["interactive-vlan-membership", "public"],
      ["trunks-and-802-1q", "public"],
      ["interactive-tag-journey", "public"],
      ["allowed-vlans-and-routing-boundary", "public"],
      ["read-port-and-capture-evidence", "account"],
      ["solve-vlan-reachability", "account"],
      ["knowledge-check-summary", "account"],
      ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "arp-and-local-delivery", published: true },
      next: { slug: "ipv4-addressing", published: true },
    });
  });

  it("publishes IPv4 addressing after VLANs with two focused interactives", () => {
    const lesson = getLesson("networking-foundations", "ipv4-addressing");

    expect(lesson).toMatchObject({ estimatedMinutes: 25, published: true });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["read-an-ipv4-address", "public"],
      ["dotted-decimal-and-binary", "public"],
      ["interactive-binary-explorer", "public"],
      ["prefixes-network-and-host", "public"],
      ["interactive-address-boundary", "public"],
      ["special-address-ranges", "public"],
      ["inspect-address-evidence", "account"],
      ["troubleshoot-addressing", "account"],
      ["knowledge-check-summary", "account"],
      ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "vlans-access-ports-and-trunks", published: true },
      next: { slug: "subnetting-fundamentals", published: true },
    });
  });

  it("publishes Subnetting Fundamentals after IPv4 with two focused interactives", () => {
    const lesson = getLesson("networking-foundations", "subnetting-fundamentals");
    expect(lesson).toMatchObject({ estimatedMinutes: 25, published: true });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["why-subnetting-exists", "public"], ["prefix-length-and-mask", "public"],
      ["network-and-host-portions", "public"], ["interactive-subnet-boundary", "public"],
      ["repeatable-calculation-method", "public"], ["ranges-and-capacity", "public"],
      ["interactive-subnet-scenarios", "public"], ["special-prefixes", "public"],
      ["local-or-gateway", "public"], ["inspect-subnet-evidence", "account"],
      ["practice-subnet-planning", "account"], ["troubleshoot-subnetting", "account"],
      ["knowledge-check-summary", "account"], ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "ipv4-addressing", published: true },
      next: { slug: "ipv6-fundamentals", published: true },
    });
  });

  it("publishes IPv6 Fundamentals after subnetting with two focused interactives", () => {
    const lesson = getLesson("networking-foundations", "ipv6-fundamentals");
    expect(lesson).toMatchObject({ estimatedMinutes: 25, published: true });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["why-ipv6-exists", "public"], ["address-structure-hex", "public"],
      ["expand-shorten", "public"], ["interactive-address-explorer", "public"],
      ["prefixes-interface-identifiers", "public"], ["address-types-scopes", "public"],
      ["no-broadcast", "public"], ["neighbor-discovery-icmpv6", "public"],
      ["interactive-ndp-slaac", "public"], ["default-router-local-delivery", "public"],
      ["inspect-ipv6-evidence", "account"], ["practice-ipv6", "account"],
      ["troubleshoot-ipv6", "account"], ["knowledge-check-summary", "account"],
      ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "subnetting-fundamentals", published: true },
      next: { slug: "routing-tables-and-default-routes", published: false },
    });
  });

  it("publishes delivery scope immediately after switching with its approved access contract", () => {
    const pathwaySlug = "networking-foundations";
    const lessonSlug = "unicast-broadcast-and-multicast-communication";
    const lesson = getLesson(pathwaySlug, lessonSlug);

    expect(lesson).toMatchObject({
      title: "Unicast, Broadcast and Multicast Communication",
      objective: "Identify a transmission's delivery scope and predict which interfaces receive, accept, or forward it.",
      seo: {
        title: "Unicast, Broadcast and Multicast Explained",
        description: "Compare unicast, broadcast, and multicast traffic and predict how switches, hosts, and routers handle each delivery type.",
      },
      estimatedMinutes: 22,
      published: true,
    });
    expect(lesson.sections).toEqual([
      { id: "why-delivery-scope-matters", label: "Why delivery scope matters", access: "public" },
      { id: "unicast-one-destination", label: "Unicast: one intended destination", access: "public" },
      { id: "broadcast-local-domain", label: "Broadcast: the local broadcast domain", access: "public" },
      { id: "multicast-receiver-group", label: "Multicast: an interested receiver group", access: "public" },
      { id: "unknown-unicast-is-not-broadcast", label: "Unknown unicast is not broadcast", access: "public" },
      { id: "compare-delivery-types", label: "Compare delivery types", access: "public" },
      { id: "delivery-scope-player", label: "Interactive delivery-scope player", access: "public" },
      { id: "predict-delivery", label: "Predict traffic delivery", access: "account" },
      { id: "diagnose-delivery-scope", label: "Diagnose delivery-scope scenarios", access: "account" },
      { id: "packet-evidence", label: "Packet evidence", access: "account" },
      { id: "knowledge-check-summary", label: "Knowledge check and summary", access: "account" },
      { id: "pro-deep-dive", label: "Pro Deep Dive", access: "pro", preview: "Discover future multicast operations, advanced packet analysis, and production troubleshooting." },
    ]);
    expect(getAdjacentLessons(pathwaySlug, lessonSlug)).toMatchObject({
      previous: { slug: "hubs-bridges-and-switches", published: true },
      next: { slug: "routers-default-gateways-and-network-boundaries", published: true },
    });
  });

  it("publishes routers and default gateways after delivery scope with its approved access contract", () => {
    const pathwaySlug = "networking-foundations";
    const lessonSlug = "routers-default-gateways-and-network-boundaries";
    const lesson = getLesson(pathwaySlug, lessonSlug);

    expect(lesson).toMatchObject({
      title: "Routers, Default Gateways and Network Boundaries",
      objective: "Decide whether a destination is local or remote and identify the first next hop.",
      estimatedMinutes: 20,
      published: true,
    });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["why-network-boundaries-matter", "public"],
      ["what-a-router-does", "public"],
      ["local-or-remote", "public"],
      ["default-gateway", "public"],
      ["direct-and-routed-delivery", "public"],
      ["what-changes-at-each-hop", "public"],
      ["route-decision-player", "public"],
      ["read-a-basic-routing-table", "account"],
      ["diagnose-gateway-boundary-problems", "account"],
      ["knowledge-check-summary", "account"],
      ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons(pathwaySlug, lessonSlug)).toMatchObject({
      previous: { slug: "unicast-broadcast-and-multicast-communication", published: true },
      next: { slug: "access-points-modems-onts-and-firewalls", published: true },
    });
  });

  it("publishes edge devices after routers with a progressive access contract", () => {
    const pathwaySlug = "networking-foundations";
    const lessonSlug = "access-points-modems-onts-and-firewalls";
    const lesson = getLesson(pathwaySlug, lessonSlug);

    expect(lesson).toMatchObject({
      title: "Access Points, Modems, ONTs and Firewalls",
      objective: "Explain where common edge devices fit and distinguish access, conversion, routing, and security roles.",
      estimatedMinutes: 20,
      published: true,
    });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["one-box-many-jobs", "public"],
      ["access-points-bridge-wireless", "public"],
      ["modems-and-onts-convert-signals", "public"],
      ["routers-and-firewalls-set-boundaries", "public"],
      ["compare-edge-devices", "public"],
      ["interactive-edge-journey", "public"],
      ["identify-device-roles", "account"],
      ["diagnose-edge-failures", "account"],
      ["knowledge-check-summary", "account"],
      ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons(pathwaySlug, lessonSlug)).toMatchObject({
      previous: { slug: "routers-default-gateways-and-network-boundaries", published: true },
      next: { slug: "osi-and-tcp-ip-models", published: true },
    });
  });

  it("publishes the packet journey capstone with progressive lesson sections", () => {
    const lesson = getLesson("networking-foundations", "first-packet-journey-through-a-small-network");
    expect(lesson).toMatchObject({
      title: "A Packet’s First Journey Through a Small Network",
      objective: "Narrate an end-to-end exchange using the concepts from Lessons 1–8.",
      estimatedMinutes: 25,
      published: true,
    });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["before-the-first-frame", "public"],
      ["resolve-the-next-hop", "public"],
      ["switch-and-route-the-request", "public"],
      ["return-traffic", "public"],
      ["complete-packet-journey", "public"],
      ["match-evidence-to-the-journey", "account"],
      ["troubleshoot-the-first-failed-hop", "account"],
      ["knowledge-check-summary", "account"],
      ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "osi-and-tcp-ip-models", published: true },
      next: { slug: "ethernet-frames-and-mac-addresses", published: true },
    });
  });

  it("publishes connection media with its approved order and access sections", () => {
    const pathwaySlug = "networking-foundations";
    const lessonSlug = "cables-fibre-wireless-and-network-connections";

    expect(listPublishedLessons(pathwaySlug).map(({ slug }) => slug)).toEqual([
      "how-networks-communicate",
      "hosts-and-network-devices",
      "cables-fibre-wireless-and-network-connections",
      "hubs-bridges-and-switches",
      "unicast-broadcast-and-multicast-communication",
      "routers-default-gateways-and-network-boundaries",
      "access-points-modems-onts-and-firewalls",
      "osi-and-tcp-ip-models",
      "first-packet-journey-through-a-small-network",
      "ethernet-frames-and-mac-addresses",
      "how-switches-learn-and-forward",
      "arp-and-local-delivery",
      "vlans-access-ports-and-trunks",
      "ipv4-addressing",
      "subnetting-fundamentals",
      "ipv6-fundamentals",
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
      next: { slug: "unicast-broadcast-and-multicast-communication", published: true },
    });
  });

  it("keeps public foundations limited to published beginner lessons", () => {
    const lessons = getPathway("networking-foundations").modules
      .flatMap(({ lessons: moduleLessons }) => moduleLessons);
    const [first, second, connectionMedia, switching, deliveryScope, routers, edgeDevices, osi, packetJourney, ethernetFrames, switchLearning, arp, vlans, ipv4, subnetting, ipv6] = [lessons[0], lessons[1], lessons[2], lessons[3], lessons[4], lessons[5], lessons[6], lessons[7], lessons[8], lessons[9], lessons[10], lessons[11], lessons[12], lessons[13], lessons[14], lessons[15]];

    expect(first.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(second.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(connectionMedia.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(switching.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(deliveryScope.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(routers.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(edgeDevices.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(packetJourney.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(ethernetFrames.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(switchLearning.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(arp.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(vlans.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(ipv4.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(subnetting.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(ipv6.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(
      lessons.slice(16).some(({ sections }) =>
        sections?.some(({ access }) => access === "public"),
      ),
    ).toBe(false);
    for (const lesson of [first, second, connectionMedia, switching, deliveryScope, routers, edgeDevices, osi, packetJourney, ethernetFrames, switchLearning, arp, vlans, ipv4, subnetting, ipv6]) {
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
