import { describe, expect, it } from "vitest";

import {
  getAdjacentLessons,
  getLesson,
  getPathway,
  listPublishedLessons,
} from "./catalog.repository";

describe("catalog repository", () => {
  it("returns the networking pathway and all planned lessons", () => {
    expect(getPathway("networking-foundations").id).toBe(
      "path_networking_foundations",
    );
    expect(
      getPathway("networking-foundations").modules.flatMap(
        (module) => module.lessons,
      ),
    ).toHaveLength(14);
  });

  it("organizes the planned lessons into the six learning modules", () => {
    const pathway = getPathway("networking-foundations");

    expect(pathway.modules.map(({ title }) => title)).toEqual([
      "Networking Essentials",
      "Ethernet and Local Networks",
      "IP Addressing and Routing",
      "Transport and Network Services",
      "Network Security Fundamentals",
      "Packet Analysis and Troubleshooting",
    ]);
    expect(
      pathway.modules.map(({ lessons }) => lessons.map(({ title }) => title)),
    ).toEqual([
      [
        "How Networks Communicate",
        "Hosts and Network Devices",
        "OSI and TCP/IP Models",
      ],
      ["ARP and MAC Learning", "Switching and VLAN Basics"],
      [
        "IPv4 Addressing",
        "Subnetting Fundamentals",
        "Routing and Default Gateways",
      ],
      ["TCP, UDP, and Ports", "DNS, DHCP, HTTP, HTTPS, and TLS"],
      ["NAT Fundamentals", "Firewall Fundamentals", "Palo Alto Basics"],
      ["End-to-End Packet Journey"],
    ]);
  });

  it("lists only published lessons in module order", () => {
    expect(
      listPublishedLessons("networking-foundations").map((lesson) => lesson.slug),
    ).toEqual([
      "how-networks-communicate",
      "hosts-and-network-devices",
      "osi-and-tcp-ip-models",
    ]);
  });

  it("finds a lesson by its stable public slug", () => {
    expect(
      getLesson("networking-foundations", "hosts-and-network-devices").title,
    ).toBe("Hosts and Network Devices");
  });

  it("returns adjacent lessons in full curriculum order", () => {
    expect(
      getAdjacentLessons("networking-foundations", "hosts-and-network-devices")
        .previous?.slug,
    ).toBe("how-networks-communicate");
    expect(
      getAdjacentLessons("networking-foundations", "hosts-and-network-devices")
        .next?.slug,
    ).toBe("osi-and-tcp-ip-models");
  });

  it("keeps How Networks Communicate before Hosts and Network Devices", () => {
    const lessons = getPathway("networking-foundations").modules.flatMap(
      ({ lessons }) => lessons,
    );

    expect(
      lessons.findIndex(({ slug }) => slug === "how-networks-communicate"),
    ).toBeLessThan(
      lessons.findIndex(({ slug }) => slug === "hosts-and-network-devices"),
    );
  });

  it("keeps End-to-End Packet Journey at the final curriculum boundary", () => {
    const lessons = getPathway("networking-foundations").modules.flatMap(
      ({ lessons }) => lessons,
    );

    expect(lessons.at(-1)?.title).toBe("End-to-End Packet Journey");
  });

  it("returns undefined at the curriculum boundaries", () => {
    expect(
      getAdjacentLessons("networking-foundations", "how-networks-communicate")
        .previous,
    ).toBeUndefined();
    expect(
      getAdjacentLessons("networking-foundations", "end-to-end-packet-journey").next,
    ).toBeUndefined();
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
