import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { pathways } from "@/features/catalog/catalog.data";

import {
  getLessonProgressManifest,
  lessonProgressManifests,
} from "./progress-manifests";

const publishedLessons = pathways.flatMap((pathway) =>
  pathway.modules.flatMap((module) =>
    module.lessons
      .filter((lesson) => lesson.published)
      .map((lesson) => ({ pathway, lesson })),
  ),
);

describe("lessonProgressManifests", () => {
  it("defines exactly one manifest for every published lesson", () => {
    expect(lessonProgressManifests).toHaveLength(28);

    expect(lessonProgressManifests.map(({ lessonId }) => lessonId).sort()).toEqual(
      publishedLessons.map(({ lesson }) => lesson.id).sort(),
    );
  });

  it("uses catalog anchors for section requirements and excludes Pro sections", () => {
    for (const { pathway, lesson } of publishedLessons) {
      const manifest = getLessonProgressManifest(pathway.id, lesson.id);
      const catalogSections = lesson.sections ?? [];

      for (const item of manifest.items.filter(({ kind }) => kind === "section")) {
        const section = catalogSections.find(({ id }) => id === item.anchor);
        expect(section, `${lesson.id}:${item.itemId}`).toBeDefined();
        expect(section?.access, `${lesson.id}:${item.itemId}`).not.toBe("pro");
      }
    }
  });

  it("returns a manifest only for the matching pathway and lesson", () => {
    expect(getLessonProgressManifest(
      "path_networking_foundations",
      "lesson_arp_and_local_delivery",
    ).lessonId).toBe("lesson_arp_and_local_delivery");

    expect(() => getLessonProgressManifest(
      "path_networking_foundations",
      "lesson_missing",
    )).toThrow(/progress manifest not found/i);
  });

  it("keeps every stable item ID mirrored in the Supabase migration", () => {
    const migration = [
      "supabase/migrations/202609090002_create_learner_progress.sql",
      "supabase/migrations/202609090003_add_ipv4_addressing_progress.sql",
      "supabase/migrations/202609090004_add_subnetting_fundamentals_progress.sql",
      "supabase/migrations/202609100001_add_ipv6_fundamentals_progress.sql",
      "supabase/migrations/202609100002_add_routing_tables_progress.sql",
      "supabase/migrations/202609100003_add_icmp_ping_path_progress.sql",
      "supabase/migrations/202609100004_add_tcp_udp_ports_progress.sql",
      "supabase/migrations/202609120001_split_tcp_udp_progress.sql",
      "supabase/migrations/202609120002_add_tcp_fast_retransmit_progress.sql",
      "supabase/migrations/202609110001_add_dhcp_progress.sql",
      "supabase/migrations/202609110002_add_dns_progress.sql",
      "supabase/migrations/202609110003_add_essential_services_progress.sql",
      "supabase/migrations/202609110004_add_nat_pat_progress.sql",
      "supabase/migrations/202609110005_add_troubleshooting_capstone_progress.sql",
      "supabase/migrations/202609190001_add_routing_fundamentals_progress.sql",
      "supabase/migrations/202609190002_add_rip_progress.sql",
      "supabase/migrations/202609190003_add_ospf_progress.sql",
    ].map((path) => readFileSync(resolve(path), "utf8")).join("\n");
    const itemIds = lessonProgressManifests.flatMap(({ items }) =>
      items.map(({ itemId }) => itemId));

    for (const itemId of itemIds) {
      expect(migration).toContain(`'${itemId}'`);
    }

    const registeredLessons = [...migration.matchAll(/^  \('path_[a-z_]+', '(lesson_[^']+)', 1, \d+\)[,;]?$/gm)]
      .map((match) => match[1]);
    expect(new Set(registeredLessons)).toEqual(new Set(lessonProgressManifests.map(({ lessonId }) => lessonId)));
  });

  it("registers the routing fundamentals lesson with one player and three checks as 12 required items", () => {
    const manifest = getLessonProgressManifest("path_routing_protocols", "lesson_routing_fundamentals");
    expect(manifest.items).toHaveLength(12);
    expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ anchor }) => anchor)).toEqual(["interactive-route-selection"]);
    expect(manifest.items.filter(({ kind }) => kind === "knowledge_check")).toHaveLength(3);
    expect(manifest.items.some(({ anchor }) => anchor === "pro-deep-dive")).toBe(false);
  });

  it("registers the RIP lesson with one player and three checks as 12 required items", () => {
    const manifest = getLessonProgressManifest("path_routing_protocols", "lesson_rip");
    expect(manifest.items).toHaveLength(12);
    expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ anchor }) => anchor)).toEqual(["interactive-rip-exchange"]);
    expect(manifest.items.filter(({ kind }) => kind === "knowledge_check")).toHaveLength(3);
    expect(manifest.items.some(({ anchor }) => anchor === "pro-deep-dive")).toBe(false);
  });

  it("registers the OSPF lesson with one player and three checks as 12 required items", () => {
    const manifest = getLessonProgressManifest("path_routing_protocols", "lesson_ospf");
    expect(manifest.items).toHaveLength(12);
    expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ anchor }) => anchor)).toEqual(["interactive-ospf-adjacency"]);
    expect(manifest.items.filter(({ kind }) => kind === "knowledge_check")).toHaveLength(3);
    expect(manifest.items.some(({ anchor }) => anchor === "pro-deep-dive")).toBe(false);
  });

  it("registers the routing lesson players and three checks as 18 required items", () => {
    const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_routing_tables_and_default_routes");
    expect(manifest.items).toHaveLength(18);
    expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ anchor }) => anchor)).toEqual(["interactive-route-selection", "interactive-hop-by-hop-forwarding"]);
    expect(manifest.items.filter(({ kind }) => kind === "knowledge_check")).toHaveLength(3);
  });

  it("registers the ICMP lesson in catalog order with two players and three checks", () => {
    const manifest = getLessonProgressManifest(
      "path_networking_foundations",
      "lesson_icmp_ping_and_path_discovery",
    );
    expect(manifest.items).toHaveLength(18);
    expect(new Set(manifest.items.map(({ itemId }) => itemId)).size).toBe(18);
    expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ anchor }) => anchor))
      .toEqual(["interactive-ping-evidence", "interactive-traceroute-discovery"]);
    expect(manifest.items.filter(({ kind }) => kind === "knowledge_check")).toHaveLength(3);
    expect(manifest.items.some(({ anchor }) => anchor === "pro-deep-dive")).toBe(false);

    const pathway = pathways.find(({ id }) => id === "path_networking_foundations");
    const lesson = pathway?.modules.flatMap(({ lessons }) => lessons)
      .find(({ id }) => id === "lesson_icmp_ping_and_path_discovery");
    const expectedCatalogAnchors = lesson?.sections
      ?.filter(({ access, id }) => access !== "pro" && id !== "knowledge-check-summary")
      .map(({ id }) => id);
    expect(manifest.items.slice(0, 15).map(({ anchor }) => anchor)).toEqual(expectedCatalogAnchors);
  });

  it("registers TCP in catalog order with separate connection, sliding-window, and fast-retransmit players", () => {
    const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_tcp_udp_and_ports");
    expect(new Set(manifest.items.map(({ itemId }) => itemId)).size).toBe(manifest.items.length);
    expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ anchor }) => anchor))
      .toEqual(["interactive-tcp-connection", "interactive-tcp-window", "interactive-fast-retransmit"]);
    expect(manifest.items.filter(({ kind }) => kind === "knowledge_check").map(({ itemId }) => itemId))
      .toEqual(["tcp_reliable_transport_check_1", "tcp_reliable_transport_check_2", "tcp_reliable_transport_check_3"]);
    expect(manifest.items.some(({ anchor }) => anchor === "pro-deep-dive")).toBe(false);
  });

  it("keeps TCP completions and starts a distinct UDP manifest", () => {
    const tcp = getLessonProgressManifest("path_networking_foundations", "lesson_tcp_udp_and_ports");
    const udp = getLessonProgressManifest("path_networking_foundations", "lesson_udp_datagrams_and_ports");
    expect(tcp.items.some(({ itemId }) => itemId === "tcp_udp_and_ports_interactive_interactive_tcp_connection")).toBe(true);
    expect(tcp.items.some(({ anchor }) => anchor === "interactive-tcp-window")).toBe(true);
    expect(udp.items.some(({ anchor }) => anchor === "interactive-udp-port-delivery")).toBe(true);
    expect(udp.items.every(({ itemId }) => itemId.startsWith("udp_datagrams_and_ports_"))).toBe(true);
  });

  it("registers DHCP in catalog order while excluding Pro sections", () => {
    const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_dhcp_and_automatic_address_configuration");
    expect(manifest.items).toHaveLength(19);
    expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ anchor }) => anchor))
      .toEqual(["interactive-dora-journey", "interactive-relay-helper"]);
    expect(manifest.items.filter(({ kind }) => kind === "knowledge_check").map(({ itemId }) => itemId))
      .toEqual(["dhcp_automatic_address_configuration_check_1", "dhcp_automatic_address_configuration_check_2", "dhcp_automatic_address_configuration_check_3"]);
    expect(manifest.items.some(({ anchor }) => anchor === "lease-timing-diagram")).toBe(false);
  });

  it("registers DNS in catalog order with two players, three checks, and no Pro items", () => {
    const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_dns_and_name_resolution");
    expect(manifest.contentVersion).toBe(1);
    expect(manifest.items).toHaveLength(21);
    expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ itemId, anchor }) => ({ itemId, anchor }))).toEqual([
      { itemId: "dns_name_resolution_interactive_complete_resolution", anchor: "interactive-complete-resolution" },
      { itemId: "dns_name_resolution_interactive_troubleshooting", anchor: "interactive-dns-troubleshooting" },
    ]);
    expect(manifest.items.filter(({ kind }) => kind === "knowledge_check").map(({ itemId }) => itemId))
      .toEqual(["dns_name_resolution_check_1", "dns_name_resolution_check_2", "dns_name_resolution_check_3"]);
    expect(manifest.items.some(({ anchor }) => anchor.includes("root-server"))).toBe(false);
  });

  it("registers all essential-service journeys and diagnostics without Pro evidence labs", () => {
    const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_http_https_tls_and_essential_network_services");
    expect(manifest.items).toHaveLength(24);
    for (const service of ["web", "remote_access", "email", "file_transfer", "time", "monitoring"]) {
      expect(manifest.items.some(({ itemId }) => itemId === `essential_services_interactive_${service}`)).toBe(true);
      expect(manifest.items.some(({ itemId }) => itemId === `essential_services_troubleshooting_${service}`)).toBe(true);
    }
    expect(manifest.items.every(({ itemId }) => !itemId.includes("rfc") && !itemId.includes("capture"))).toBe(true);
  });

  it("registers NAT public sections, three Account interactives, and five checks without Pro labs", () => {
    const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_nat_pat_and_the_complete_internet_packet_journey");
    expect(manifest.contentVersion).toBe(1);
    expect(manifest.items).toHaveLength(15);
    expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ itemId }) => itemId)).toEqual([
      "nat_pat_interactive_journey", "nat_pat_mapping_lab", "nat_pat_troubleshooting_lab",
    ]);
    expect(manifest.items.filter(({ kind }) => kind === "knowledge_check").map(({ itemId }) => itemId)).toEqual([
      "nat_pat_check_public_1", "nat_pat_check_public_2", "nat_pat_check_account_1", "nat_pat_check_account_2", "nat_pat_check_account_3",
    ]);
    expect(manifest.items.some(({ anchor }) => anchor.startsWith("pro-"))).toBe(false);
  });

  it("registers guided milestones and optional Pro milestones without blocking Account completion", () => {
    const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_systematic_network_troubleshooting_capstone");
    expect(manifest.contentVersion).toBe(1);
    expect(manifest.items).toHaveLength(15);
    expect(manifest.items.map(({ itemId }) => itemId)).toContain("capstone_guided_incident");
    expect(manifest.items.filter(({ kind, required }) => kind === "interactive" && required).map(({ anchor }) => anchor)).toEqual([
      "guided-branch-incident", "guided-vlan-check", "guided-route-check", "guided-dns-check", "restoration-verification",
    ]);
    expect(manifest.items.filter(({ required }) => required)).toHaveLength(12);
    expect(manifest.items.filter(({ required }) => !required).map(({ itemId }) => itemId)).toEqual([
      "capstone_pro_evidence", "capstone_pro_validation", "capstone_pro_report",
    ]);
  });

  it("parenthesizes the CASE expression used by the progress event guard", () => {
    const migration = readFileSync(
      resolve("supabase/migrations/202609090002_create_learner_progress.sql"),
      "utf8",
    );

    expect(migration).toContain("if p_event_type <> (case v_item.kind");
    expect(migration).toContain("else 'knowledge_check_attempted' end) then");
  });

  it("assigns every knowledge check its manifest ID in account content", () => {
    const seen = new Set<string>();
    for (const { pathway, lesson } of publishedLessons) {
      const source = ["public", "account"].map((tier) => resolve(
        `src/content/${pathway.slug}/${lesson.slug}.${tier}.mdx`,
      )).filter(existsSync).map((path) => readFileSync(path, "utf8")).join("\n");
      const contentIds = [...source.matchAll(/<KnowledgeCheck\s+progressItemId="([^"]+)"/g)]
        .map((match) => match[1]);
      const manifestIds = getLessonProgressManifest(pathway.id, lesson.id).items
        .filter(({ kind }) => kind === "knowledge_check")
        .map(({ itemId }) => itemId);
      expect(contentIds, lesson.id).toEqual(manifestIds);
      for (const itemId of contentIds) {
        expect(seen.has(itemId), itemId).toBe(false);
        seen.add(itemId);
      }
    }
  });
});
