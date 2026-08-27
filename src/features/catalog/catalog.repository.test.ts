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
    ).toHaveLength(12);
  });

  it("lists only published lessons in module order", () => {
    expect(
      listPublishedLessons("networking-foundations").map((lesson) => lesson.slug),
    ).toEqual(["how-networks-communicate"]);
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
