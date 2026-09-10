import { pathways } from "@/features/catalog/catalog.data";
import type { LessonSection } from "@/features/catalog/catalog.types";

import { parseLessonProgressManifest } from "./progress-manifest.schema";
import type { LessonProgressManifest, ProgressManifestItem } from "./progress.types";

type LessonProgressDefinition = Readonly<{
  lessonId: string;
  itemPrefix?: string;
  interactiveAnchors: readonly string[];
  knowledgeCheckCount: number;
  knowledgeAnchor: string | null;
}>;

const definitions = [
  { lessonId: "lesson_how_networks_communicate", interactiveAnchors: ["packet-journey"], knowledgeCheckCount: 1, knowledgeAnchor: "knowledge-check" },
  { lessonId: "lesson_hosts_and_network_devices", interactiveAnchors: ["compare-journeys"], knowledgeCheckCount: 2, knowledgeAnchor: "test-understanding" },
  { lessonId: "lesson_cables_fibre_wireless_and_network_connections", interactiveAnchors: ["compare-media", "design-a-connection"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_hubs_bridges_and_switches", interactiveAnchors: ["compare-hub-bridge-switch", "forward-the-frame"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_unicast_broadcast_and_multicast_communication", interactiveAnchors: ["delivery-scope-player", "predict-delivery"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_routers_default_gateways_and_network_boundaries", interactiveAnchors: ["route-decision-player", "read-a-basic-routing-table"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_access_points_modems_onts_and_firewalls", interactiveAnchors: ["interactive-edge-journey"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_osi_and_tcp_ip_models", interactiveAnchors: ["encapsulation-lab"], knowledgeCheckCount: 2, knowledgeAnchor: "knowledge-summary" },
  { lessonId: "lesson_first_packet_journey_through_a_small_network", interactiveAnchors: ["complete-packet-journey"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_ethernet_frames_and_mac_addresses", interactiveAnchors: ["interactive-frame-delivery"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_how_switches_learn_and_forward", interactiveAnchors: ["interactive-switch-learning", "read-mac-table-evidence"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_arp_and_local_delivery", interactiveAnchors: ["interactive-arp-journey", "arp-variants-and-boundaries"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_vlans_access_ports_and_trunks", interactiveAnchors: ["interactive-vlan-membership", "interactive-tag-journey"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_ipv4_addressing", interactiveAnchors: ["interactive-binary-explorer", "interactive-address-boundary"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_subnetting_fundamentals", interactiveAnchors: ["interactive-subnet-boundary", "interactive-subnet-scenarios"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_ipv6_fundamentals", interactiveAnchors: ["interactive-address-explorer", "interactive-ndp-slaac"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_routing_tables_and_default_routes", interactiveAnchors: ["interactive-route-selection", "interactive-hop-by-hop-forwarding"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_icmp_ping_and_path_discovery", interactiveAnchors: ["interactive-ping-evidence", "interactive-traceroute-discovery"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_tcp_udp_and_ports", interactiveAnchors: ["interactive-tcp-connection", "interactive-tcp-udp-port-delivery"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_dhcp_and_automatic_address_configuration", itemPrefix: "dhcp_automatic_address_configuration", interactiveAnchors: ["interactive-dora-journey", "interactive-relay-helper"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
] as const satisfies readonly LessonProgressDefinition[];

function itemPrefix(lessonId: string) {
  return lessonId.replace(/^lesson_/, "");
}

function sectionItem(lessonId: string, section: LessonSection, prefix = itemPrefix(lessonId)): ProgressManifestItem {
  return {
    itemId: `${prefix}_section_${section.id.replaceAll("-", "_")}`,
    kind: "section",
    label: section.label,
    anchor: section.id,
    required: true,
  };
}

function interactiveItem(lessonId: string, section: LessonSection, prefix = itemPrefix(lessonId)): ProgressManifestItem {
  return {
    itemId: `${prefix}_interactive_${section.id.replaceAll("-", "_")}`,
    kind: "interactive",
    label: section.label,
    anchor: section.id,
    required: true,
  };
}

function buildItems(
  lessonId: string,
  sections: readonly LessonSection[],
  definition: LessonProgressDefinition,
) {
  const prefix = definition.itemPrefix ?? itemPrefix(lessonId);
  const items = sections
    .filter(({ access, id }) => access !== "pro" && id !== definition.knowledgeAnchor)
    .map((section) => definition.interactiveAnchors.includes(section.id)
      ? interactiveItem(lessonId, section, prefix)
      : sectionItem(lessonId, section, prefix));

  if (definition.knowledgeAnchor) {
    for (let index = 1; index <= definition.knowledgeCheckCount; index += 1) {
      items.push({
        itemId: `${prefix}_check_${index}`,
        kind: "knowledge_check",
        label: `Knowledge check ${index}`,
        anchor: `${prefix.replaceAll("_", "-")}-check-${index}`,
        required: true,
      });
    }
  }

  return items;
}

function createManifests() {
  const pathway = pathways.find(({ id }) => id === "path_networking_foundations");
  if (!pathway) throw new Error("Networking foundations pathway not found.");

  const lessons = pathway.modules.flatMap(({ lessons: moduleLessons }) => moduleLessons);

  return definitions.map((definition) => {
    const lesson = lessons.find(({ id }) => id === definition.lessonId);
    if (!lesson?.published) {
      throw new Error(`Published lesson not found for progress: ${definition.lessonId}`);
    }

    return parseLessonProgressManifest({
      pathwayId: pathway.id,
      lessonId: lesson.id,
      contentVersion: 1,
      items: buildItems(lesson.id, lesson.sections ?? [], definition),
    });
  });
}

export const lessonProgressManifests = createManifests();

export function getLessonProgressManifest(pathwayId: string, lessonId: string): LessonProgressManifest {
  const manifest = lessonProgressManifests.find((candidate) =>
    candidate.pathwayId === pathwayId && candidate.lessonId === lessonId);

  if (!manifest) throw new Error(`Progress manifest not found: ${pathwayId}/${lessonId}`);
  return manifest;
}
