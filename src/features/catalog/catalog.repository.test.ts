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
      "hosts-and-network-devices",
      "how-networks-communicate",
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

  it("keeps only the first two lesson foundations public", () => {
    const lessons = getPathway("networking-foundations").modules
      .flatMap(({ lessons: moduleLessons }) => moduleLessons);
    const [first, second, osi] = [lessons[0], lessons[1], lessons[6]];

    expect(first.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(second.sections?.some(({ access }) => access === "public")).toBe(true);
    expect(
      lessons.slice(2).some(({ sections }) =>
        sections?.some(({ access }) => access === "public"),
      ),
    ).toBe(false);
    for (const lesson of [first, second, osi]) {
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
