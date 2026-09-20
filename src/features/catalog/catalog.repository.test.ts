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
      title: "Computer Network Basics",
      lessons: [
        "Introduction to Computer Networks and Network Devices",
        "Hosts, Clients and Servers",
        "Hubs",
        "Bridges",
        "Switches",
        "Routers",
        "Physical and Logical Addressing",
        "OSI and TCP/IP Models",
        "Computer Network Basics Final Quiz",
      ],
    },
    {
      title: "Ethernet, Switching and Local Networks",
      lessons: [
        "Cables, Fibre, Wireless and Network Connections",
        "Unicast, Broadcast and Multicast Communication",
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
        "TCP: Reliable Transport",
        "UDP: Datagrams and Ports",
        "DHCP and Automatic Address Configuration",
        "DNS and Name Resolution",
        "HTTP, HTTPS, TLS and Essential Network Services",
      ],
    },
    {
      title: "NAT and Internet Communication",
      lessons: [
        "Access Points, Modems, ONTs and Firewalls",
        "NAT, PAT and the Complete Internet Packet Journey",
        "A Packet’s First Journey Through a Small Network",
      ],
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
    expect(pathway.modules.flatMap(({ lessons }) => lessons)).toHaveLength(29);
  });

  it("preserves implemented routes and removes security lessons", () => {
    const pathway = getPathway("networking-foundations");
    const lessons = pathway.modules.flatMap(({ lessons }) => lessons);

    expect(listPublishedLessons(pathway.slug).map(({ slug }) => slug).sort()).toEqual([
      "access-points-modems-onts-and-firewalls",
      "arp-and-local-delivery",
      "bridges",
      "cables-fibre-wireless-and-network-connections",
      "computer-network-basics-final-quiz",
      "dhcp-and-automatic-address-configuration",
      "dns-and-name-resolution",
      "ethernet-frames-and-mac-addresses",
      "first-packet-journey-through-a-small-network",
      "hosts-and-network-devices",
      "how-networks-communicate",
      "how-switches-learn-and-forward",
      "http-https-tls-and-essential-network-services",
      "hubs",
      "icmp-ping-and-path-discovery",
      "ipv4-addressing",
      "ipv6-fundamentals",
      "nat-pat-and-the-complete-internet-packet-journey",
      "osi-and-tcp-ip-models",
      "physical-and-logical-addressing",
      "routers-default-gateways-and-network-boundaries",
      "routing-tables-and-default-routes",
      "subnetting-fundamentals",
      "switches",
      "systematic-network-troubleshooting-capstone",
      "tcp-reliable-transport",
      "udp-datagrams-and-ports",
      "unicast-broadcast-and-multicast-communication",
      "vlans-access-ports-and-trunks",
    ]);
    expect(getLesson(pathway.slug, "how-networks-communicate").title)
      .toBe("Introduction to Computer Networks and Network Devices");
    expect(getLesson(pathway.slug, "hosts-and-network-devices").title)
      .toBe("Hosts, Clients and Servers");
    expect(getLesson(pathway.slug, "osi-and-tcp-ip-models").title)
      .toBe("OSI and TCP/IP Models");
    expect(lessons.map(({ title }) => title).join(" ")).not.toMatch(
      /Firewall Fundamentals|Palo Alto|IPsec|VPN/i,
    );
  });

  it("publishes Ethernet frames after delivery scope with progressive access", () => {
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
      previous: { slug: "unicast-broadcast-and-multicast-communication", published: true },
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
      next: { slug: "routing-tables-and-default-routes", published: true },
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
      previous: { slug: "cables-fibre-wireless-and-network-connections", published: true },
      next: { slug: "ethernet-frames-and-mac-addresses", published: true },
    });
  });

  it("publishes the introductory router lesson in Computer Network Basics", () => {
    const pathwaySlug = "networking-foundations";
    const lessonSlug = "routers-default-gateways-and-network-boundaries";
    const lesson = getLesson(pathwaySlug, lessonSlug);

    expect(lesson).toMatchObject({
      title: "Routers",
      objective: "Explain how routers connect different IP networks and act as default gateways.",
      estimatedMinutes: 12,
      published: true,
    });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["what-a-router-does", "public"],
      ["router-interfaces", "public"],
      ["network-boundaries", "public"],
      ["default-gateway", "public"],
      ["place-the-router", "public"],
      ["knowledge-check", "public"],
    ]);
    expect(getAdjacentLessons(pathwaySlug, lessonSlug)).toMatchObject({
      previous: { slug: "switches", published: true },
      next: { slug: "physical-and-logical-addressing", published: true },
    });
  });

  it("relocates edge devices to the start of the NAT module", () => {
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
      previous: { slug: "http-https-tls-and-essential-network-services", published: true },
      next: { slug: "nat-pat-and-the-complete-internet-packet-journey", published: true },
    });
  });

  it("relocates the packet journey to the end of the NAT module", () => {
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
      previous: { slug: "nat-pat-and-the-complete-internet-packet-journey", published: true },
      next: { slug: "systematic-network-troubleshooting-capstone", published: true },
    });
  });

  it("publishes connection media with its approved order and access sections", () => {
    const pathwaySlug = "networking-foundations";
    const lessonSlug = "cables-fibre-wireless-and-network-connections";

    expect(listPublishedLessons(pathwaySlug).map(({ slug }) => slug)).toEqual([
      "how-networks-communicate",
      "hosts-and-network-devices",
      "hubs",
      "bridges",
      "switches",
      "routers-default-gateways-and-network-boundaries",
      "physical-and-logical-addressing",
      "osi-and-tcp-ip-models",
      "computer-network-basics-final-quiz",
      "cables-fibre-wireless-and-network-connections",
      "unicast-broadcast-and-multicast-communication",
      "ethernet-frames-and-mac-addresses",
      "how-switches-learn-and-forward",
      "arp-and-local-delivery",
      "vlans-access-ports-and-trunks",
      "ipv4-addressing",
      "subnetting-fundamentals",
      "ipv6-fundamentals",
      "routing-tables-and-default-routes",
      "icmp-ping-and-path-discovery",
      "tcp-reliable-transport",
      "udp-datagrams-and-ports",
      "dhcp-and-automatic-address-configuration",
      "dns-and-name-resolution",
      "http-https-tls-and-essential-network-services",
      "access-points-modems-onts-and-firewalls",
      "nat-pat-and-the-complete-internet-packet-journey",
      "first-packet-journey-through-a-small-network",
      "systematic-network-troubleshooting-capstone",
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

  it("publishes hubs, bridges and switches as separate introductory lessons", () => {
    const pathwaySlug = "networking-foundations";
    expect(["hubs", "bridges", "switches"].map((slug) => getLesson(pathwaySlug, slug))).toMatchObject([
      { title: "Hubs", estimatedMinutes: 8, published: true },
      { title: "Bridges", estimatedMinutes: 10, published: true },
      { title: "Switches", estimatedMinutes: 12, published: true },
    ]);
    expect(getAdjacentLessons(pathwaySlug, "bridges")).toMatchObject({
      previous: { slug: "hubs" },
      next: { slug: "switches" },
    });
  });

  it("keeps every published lesson discoverable and gives every lesson public content", () => {
    const lessons = getPathway("networking-foundations").modules
      .flatMap(({ lessons: moduleLessons }) => moduleLessons);
    for (const lesson of lessons) {
      expect(lesson.published).toBe(true);
      expect(lesson.sections?.some(({ access }) => access === "public")).toBe(true);
    }
  });

  it("derives adjacency across the approved curriculum", () => {
    expect(getAdjacentLessons("networking-foundations", "how-networks-communicate").previous)
      .toBeUndefined();
    expect(getAdjacentLessons("networking-foundations", "how-networks-communicate").next?.slug)
      .toBe("hosts-and-network-devices");
    expect(getAdjacentLessons("networking-foundations", "hosts-and-network-devices").next?.slug)
      .toBe("hubs");
    const connectionMedia = getAdjacentLessons(
      "networking-foundations",
      "cables-fibre-wireless-and-network-connections",
    );
    expect(connectionMedia.previous?.slug).toBe("computer-network-basics-final-quiz");
    expect(connectionMedia.next?.slug).toBe("unicast-broadcast-and-multicast-communication");
    expect(getAdjacentLessons("networking-foundations", "osi-and-tcp-ip-models").previous?.slug)
      .toBe("physical-and-logical-addressing");
    expect(getAdjacentLessons("networking-foundations", "osi-and-tcp-ip-models").next?.slug)
      .toBe("computer-network-basics-final-quiz");
    expect(getAdjacentLessons("networking-foundations", "computer-network-basics-final-quiz")).toMatchObject({
      previous: { slug: "osi-and-tcp-ip-models" },
      next: { slug: "cables-fibre-wireless-and-network-connections" },
    });
    expect(getAdjacentLessons("networking-foundations", "systematic-network-troubleshooting-capstone").next)
      .toBeUndefined();
  });

  it("throws the documented error for an unknown lesson", () => {
    expect(() => getLesson("networking-foundations", "missing")).toThrowError(
      "LESSON_NOT_FOUND",
    );
  });

  it("publishes routing tables after IPv6 with the approved access sequence", () => {
    const lesson = getLesson("networking-foundations", "routing-tables-and-default-routes");
    expect(lesson).toMatchObject({
      id: "lesson_routing_tables_and_default_routes",
      published: true,
      estimatedMinutes: 25,
    });
    expect(lesson.sections?.map(({ id }) => id)).toEqual([
      "why-routing-exists", "route-table-anatomy", "route-sources",
      "how-prefix-matching-works", "interactive-route-selection", "longest-prefix-match",
      "administrative-distance", "route-metric", "next-hop-outgoing-interface",
      "interactive-hop-by-hop-forwarding", "ipv4-ipv6-routing", "no-route-packet-disposal",
      "inspect-routing-evidence", "guided-routing-practice", "troubleshoot-routing",
      "knowledge-check-summary", "pro-deep-dive",
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "ipv6-fundamentals", published: true },
      next: { slug: "icmp-ping-and-path-discovery", published: true },
    });
  });

  it("publishes ICMP after routing with the approved access sequence", () => {
    const lesson = getLesson("networking-foundations", "icmp-ping-and-path-discovery");
    expect(lesson).toMatchObject({
      id: "lesson_icmp_ping_and_path_discovery",
      published: true,
      estimatedMinutes: 20,
    });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["why-icmp-exists", "public"], ["icmp-message-anatomy", "public"],
      ["informational-and-error-messages", "public"], ["echo-request-and-reply", "public"],
      ["interactive-ping-evidence", "public"], ["what-successful-ping-proves", "public"],
      ["timeouts-loss-and-rtt", "public"], ["destination-unreachable", "public"],
      ["ttl-exceeded", "public"], ["interactive-traceroute-discovery", "public"],
      ["why-traceroute-can-be-incomplete", "public"], ["safe-conclusions", "public"],
      ["inspect-icmp-evidence", "account"], ["guided-icmp-diagnosis", "account"],
      ["troubleshoot-icmp", "account"], ["knowledge-check-summary", "account"],
      ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "routing-tables-and-default-routes", published: true },
      next: { slug: "tcp-reliable-transport", published: true },
    });
  });

  it("publishes TCP after ICMP with UDP following it", () => {
    const lesson = getLesson("networking-foundations", "tcp-reliable-transport");
    expect(lesson).toMatchObject({ id: "lesson_tcp_udp_and_ports", published: true, estimatedMinutes: 40 });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["why-transport-protocols-exist", "public"], ["segments-datagrams-ports-sockets", "public"],
      ["source-destination-ports-multiplexing", "public"], ["tcp-udp-header-essentials", "public"],
      ["interactive-tcp-connection", "public"], ["mss-and-segment-sizing", "public"],
      ["window-scaling", "public"], ["sequence-acknowledgements-ordered-delivery", "public"],
      ["loss-retransmission-duplicates", "public"], ["flow-control-receive-window", "public"],
      ["interactive-tcp-window", "public"], ["sack-permitted-and-blocks", "public"],
      ["fast-retransmit", "public"], ["interactive-fast-retransmit", "public"], ["graceful-closure-resets", "public"],
      ["inspect-transport-evidence", "account"], ["guided-transport-diagnosis", "account"],
      ["troubleshoot-transport", "account"], ["knowledge-check-summary", "account"],
      ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "icmp-ping-and-path-discovery", published: true },
      next: { slug: "udp-datagrams-and-ports", published: true },
    });
  });

  it("offers focused TCP and UDP lessons consecutively while retaining the TCP identity", () => {
    const tcp = getLesson("networking-foundations", "tcp-reliable-transport");
    const udp = getLesson("networking-foundations", "udp-datagrams-and-ports");
    expect(tcp.id).toBe("lesson_tcp_udp_and_ports");
    expect(udp.id).toBe("lesson_udp_datagrams_and_ports");
    expect(getAdjacentLessons("networking-foundations", tcp.slug).next?.slug).toBe(udp.slug);
    expect(tcp.sections?.some(({ id }) => id === "interactive-tcp-window")).toBe(true);
    expect(udp.sections?.some(({ id }) => id === "interactive-udp-port-delivery")).toBe(true);
  });

  it("publishes DHCP between transport and DNS with the approved access sequence", () => {
    const lesson = getLesson("networking-foundations", "dhcp-and-automatic-address-configuration");
    expect(lesson).toMatchObject({ id: "lesson_dhcp_and_automatic_address_configuration", published: true, estimatedMinutes: 35 });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["why-automatic-configuration-exists", "public"], ["dhcp-roles", "public"], ["udp-ports-67-68", "public"],
      ["broadcast-unicast-rules", "public"], ["dhcp-packet-structure", "public"], ["interactive-dora-journey", "public"],
      ["lease-contents", "public"], ["lease-lifecycle", "public"], ["interactive-relay-helper", "public"],
      ["dhcp-boundaries", "public"], ["dhcp-evidence", "public"], ["summary", "public"],
      ["inspect-dhcp-evidence", "account"], ["guided-dora-diagnosis", "account"], ["guided-relay-diagnosis", "account"],
      ["troubleshoot-dhcp", "account"], ["knowledge-check-summary", "account"],
      ["lease-timing-diagram", "pro"], ["rfc-level-checks", "pro"], ["pro-deep-dive", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "udp-datagrams-and-ports", published: true },
      next: { slug: "dns-and-name-resolution", published: true },
    });
  });

  it("publishes DNS after DHCP with the approved tiered section sequence", () => {
    const lesson = getLesson("networking-foundations", "dns-and-name-resolution");
    expect(lesson).toMatchObject({ id: "lesson_dns_and_name_resolution", published: true, estimatedMinutes: 25 });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["why-name-resolution-exists", "public"], ["dns-roles-responsibility-boundaries", "public"],
      ["domain-labels-zones-delegation", "public"], ["recursive-service-iterative-referrals", "public"],
      ["interactive-complete-resolution", "public"], ["dns-message-header-structure", "public"],
      ["record-types-selection-rules", "public"], ["dns-transports", "public"],
      ["caching-ttl-negative-caching", "public"], ["response-codes-nodata", "public"],
      ["reverse-dns", "public"], ["interactive-dns-troubleshooting", "public"],
      ["dns-command-capture-evidence", "public"], ["common-dns-misconceptions", "public"],
      ["summary-next-steps", "public"], ["cold-warm-cache-practice", "account"],
      ["record-selection-practice", "account"], ["dns-packet-capture-practice", "account"],
      ["knowledge-check-summary", "account"], ["dns-timing-diagram", "pro"],
      ["rfc-level-dns-checks", "pro"], ["dnssec-advanced-wireshark", "pro"],
      ["advanced-dns-operations", "pro"], ["root-server-bootstrap-bonus", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "dhcp-and-automatic-address-configuration", published: true },
      next: { slug: "http-https-tls-and-essential-network-services", published: true },
    });
  });

  it("publishes essential services after DNS with equal tier depth", () => {
    const lesson = getLesson("networking-foundations", "http-https-tls-and-essential-network-services");
    expect(lesson).toMatchObject({
      id: "lesson_http_https_tls_and_essential_network_services",
      estimatedMinutes: 55,
      published: true,
    });
    expect(lesson.sections?.filter(({ access }) => access === "public")).toHaveLength(6);
    expect(lesson.sections?.filter(({ access }) => access === "account")).toHaveLength(13);
    expect(lesson.sections?.filter(({ access }) => access === "pro")).toHaveLength(12);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "dns-and-name-resolution", published: true },
    });
  });

  it("publishes the NAT packet journey with progressive access", () => {
    const lesson = getLesson("networking-foundations", "nat-pat-and-the-complete-internet-packet-journey");
    expect(lesson).toMatchObject({ id: "lesson_nat_pat_and_the_complete_internet_packet_journey", estimatedMinutes: 35, published: true });
    expect(lesson.sections?.map(({ id, access }) => [id, access])).toEqual([
      ["ipv4-translation-boundary", "public"], ["nat-vocabulary-address-realms", "public"],
      ["static-nat-port-forwarding", "public"], ["dynamic-nat-address-pools", "public"],
      ["pat-translation-table-state", "public"], ["complete-internet-packet-journey", "public"],
      ["return-traffic-timeouts-failures", "public"], ["public-knowledge-check", "public"],
      ["account-pat-journey", "account"], ["account-mapping-lab", "account"],
      ["account-troubleshooting-lab", "account"], ["account-knowledge-checks", "account"],
      ["pro-packet-analysis", "pro"], ["pro-rfc-validation", "pro"], ["pro-u-turn-nat-lab", "pro"],
    ]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({
      previous: { slug: "access-points-modems-onts-and-firewalls", published: true },
      next: { slug: "first-packet-journey-through-a-small-network", published: true },
    });
  });

  it("publishes the troubleshooting capstone with progressive access", () => {
    const lesson = getLesson("networking-foundations", "systematic-network-troubleshooting-capstone");
    expect(lesson).toMatchObject({ id: "lesson_systematic_network_troubleshooting_capstone", estimatedMinutes: 45, published: true });
    expect(lesson.sections?.map(({ access }) => access)).toEqual(["public", "public", "public", "public", "public", "public", "account", "account", "account", "pro", "pro", "pro"]);
    expect(getAdjacentLessons("networking-foundations", lesson.slug)).toMatchObject({ previous: { slug: "first-packet-journey-through-a-small-network", published: true }, next: undefined });
  });

  it("throws the documented error for an unknown pathway", () => {
    expect(() => getPathway("missing")).toThrowError("PATHWAY_NOT_FOUND");
  });
});
