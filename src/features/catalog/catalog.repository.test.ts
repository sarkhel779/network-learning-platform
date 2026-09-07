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
    ).toHaveLength(13);
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
      ["NAT Fundamentals", "Firewall Fundamentals"],
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

  it("gives published foundation lessons distinct learner-focused SEO metadata", () => {
    const publishedLessons = listPublishedLessons("networking-foundations");

    expect(publishedLessons.map(({ seo }) => seo)).toEqual([
      {
        title: "How Networks Communicate: A Beginner's Guide",
        description:
          "Learn the decisions that move data between hosts and trace a packet across a network.",
      },
      {
        title: "Hosts and Network Devices: Learn the Basics",
        description:
          "Identify hosts and network devices, then predict each packet's path through a topology.",
      },
      {
        title: "OSI and TCP/IP Models Explained",
        description:
          "Connect the OSI and TCP/IP models to practical network tasks, packet layers, and troubleshooting.",
      },
    ]);
  });

  it("orders published lesson access from public through one final Pro Deep Dive", () => {
    const publishedLessons = listPublishedLessons("networking-foundations");

    expect(
      publishedLessons.map(({ sections }) =>
        sections.map(({ id, access }) => ({ id, access })),
      ),
    ).toEqual([
      [
        { id: "communication-decisions", access: "public" },
        { id: "packet-journey", access: "public" },
        { id: "wireshark-check", access: "account" },
        { id: "knowledge-check", access: "account" },
        { id: "interview-scenario", access: "account" },
        { id: "pro-deep-dive", access: "pro" },
      ],
      [
        { id: "what-is-a-host", access: "public" },
        { id: "connecting-devices", access: "public" },
        { id: "explore-topology", access: "public" },
        { id: "compare-journeys", access: "public" },
        { id: "windows-checks", access: "account" },
        { id: "wireshark-checks", access: "account" },
        { id: "test-understanding", access: "account" },
        { id: "summary", access: "account" },
        { id: "pro-deep-dive", access: "pro" },
      ],
      [
        { id: "why-layers", access: "public" },
        { id: "osi-model", access: "public" },
        { id: "tcp-ip-model", access: "public" },
        { id: "model-mapping", access: "public" },
        { id: "encapsulation-lab", access: "public" },
        { id: "device-layer-scope", access: "account" },
        { id: "wireshark-layers", access: "account" },
        { id: "troubleshooting-interview", access: "account" },
        { id: "knowledge-summary", access: "account" },
        { id: "pro-deep-dive", access: "pro" },
      ],
    ]);

    for (const lesson of publishedLessons) {
      expect(lesson.sections.at(-1)).toEqual({
        id: "pro-deep-dive",
        label: "Pro Deep Dive",
        access: "pro",
        preview: "Check the governing RFC and relevant read-only vendor diagnostics.",
      });
    }
  });

  it("has no obsolete lesson-level access or Palo Alto foundation lesson", () => {
    const lessons = getPathway("networking-foundations").modules.flatMap(
      ({ lessons: moduleLessons }) => moduleLessons,
    );

    expect(lessons).toHaveLength(13);
    expect(lessons).not.toContainEqual(
      expect.objectContaining({ id: expect.stringMatching(/palo-alto/i) }),
    );
    expect(lessons).not.toContainEqual(
      expect.objectContaining({ slug: expect.stringMatching(/palo-alto/i) }),
    );
    expect(lessons).not.toContainEqual(
      expect.objectContaining({ title: expect.stringMatching(/palo alto/i) }),
    );
    for (const lesson of lessons) {
      expect(lesson).not.toHaveProperty("access");
    }
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
