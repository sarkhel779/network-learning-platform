import { pathways } from "@/features/catalog/catalog.data";
import type { LessonSection } from "@/features/catalog/catalog.types";

import { parseLessonProgressManifest } from "./progress-manifest.schema";
import type { LessonProgressManifest, ProgressManifestItem } from "./progress.types";

type LessonProgressDefinition = Readonly<{
  lessonId: string;
  itemPrefix?: string;
  stripInteractiveAnchorPrefix?: boolean;
  interactiveAnchors: readonly string[];
  excludedAnchors?: readonly string[];
  interactiveItemIds?: Readonly<Record<string, string>>;
  knowledgeCheckCount: number;
  knowledgeCheckItemIds?: readonly string[];
  knowledgeAnchor: string | null;
  knowledgeAnchors?: readonly string[];
  extraItems?: readonly ProgressManifestItem[];
}>;

const definitions = [
  { lessonId: "lesson_how_networks_communicate", interactiveAnchors: ["identify-device-roles"], knowledgeCheckCount: 1, knowledgeAnchor: "knowledge-check" },
  { lessonId: "lesson_hosts_and_network_devices", interactiveAnchors: ["classify-host-roles"], excludedAnchors: ["follow-host-conversations"], knowledgeCheckCount: 2, knowledgeAnchor: "knowledge-check" },
  { lessonId: "lesson_hubs", interactiveAnchors: ["repeat-a-signal"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check" },
  { lessonId: "lesson_bridges", interactiveAnchors: ["compare-segments"], knowledgeCheckCount: 1, knowledgeAnchor: "knowledge-check" },
  { lessonId: "lesson_switches", interactiveAnchors: ["match-hosts-to-ports"], knowledgeCheckCount: 1, knowledgeAnchor: "knowledge-check" },
  { lessonId: "lesson_cables_fibre_wireless_and_network_connections", interactiveAnchors: ["compare-media", "design-a-connection"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_unicast_broadcast_and_multicast_communication", interactiveAnchors: ["delivery-scope-player", "predict-delivery"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_routers_default_gateways_and_network_boundaries", interactiveAnchors: ["place-the-router"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check" },
  { lessonId: "lesson_physical_and_logical_addressing", interactiveAnchors: ["inspect-address-formats"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check" },
  { lessonId: "lesson_access_points_modems_onts_and_firewalls", interactiveAnchors: ["interactive-edge-journey"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_osi_and_tcp_ip_models", interactiveAnchors: ["encapsulation-lab"], knowledgeCheckCount: 2, knowledgeAnchor: "knowledge-check" },
  { lessonId: "lesson_computer_network_basics_final_quiz", interactiveAnchors: [], knowledgeCheckCount: 8, knowledgeAnchor: "final-module-quiz" },
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
  { lessonId: "lesson_tcp_udp_and_ports", interactiveAnchors: ["interactive-tcp-connection", "interactive-tcp-window", "interactive-fast-retransmit"], knowledgeCheckCount: 3, knowledgeCheckItemIds: ["tcp_reliable_transport_check_1", "tcp_reliable_transport_check_2", "tcp_reliable_transport_check_3"], knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_udp_datagrams_and_ports", interactiveAnchors: ["interactive-udp-port-delivery"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_dhcp_and_automatic_address_configuration", itemPrefix: "dhcp_automatic_address_configuration", interactiveAnchors: ["interactive-dora-journey", "interactive-relay-helper"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_dns_and_name_resolution", itemPrefix: "dns_name_resolution", stripInteractiveAnchorPrefix: true, interactiveAnchors: ["interactive-complete-resolution", "interactive-dns-troubleshooting"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  {
    lessonId: "lesson_http_https_tls_and_essential_network_services", itemPrefix: "essential_services",
    interactiveAnchors: ["web-service-journey", "web-troubleshooting", "remote-access-journey", "remote-access-troubleshooting", "email-journey", "email-troubleshooting", "file-transfer-journey", "file-transfer-troubleshooting", "time-journey", "time-troubleshooting", "monitoring-journey", "monitoring-troubleshooting"],
    interactiveItemIds: {
      "web-service-journey": "essential_services_interactive_web", "web-troubleshooting": "essential_services_troubleshooting_web",
      "remote-access-journey": "essential_services_interactive_remote_access", "remote-access-troubleshooting": "essential_services_troubleshooting_remote_access",
      "email-journey": "essential_services_interactive_email", "email-troubleshooting": "essential_services_troubleshooting_email",
      "file-transfer-journey": "essential_services_interactive_file_transfer", "file-transfer-troubleshooting": "essential_services_troubleshooting_file_transfer",
      "time-journey": "essential_services_interactive_time", "time-troubleshooting": "essential_services_troubleshooting_time",
      "monitoring-journey": "essential_services_interactive_monitoring", "monitoring-troubleshooting": "essential_services_troubleshooting_monitoring",
    },
    knowledgeCheckCount: 6,
    knowledgeCheckItemIds: ["essential_services_check_web", "essential_services_check_remote_access", "essential_services_check_email", "essential_services_check_file_transfer", "essential_services_check_time", "essential_services_check_monitoring"],
    knowledgeAnchor: "knowledge-check-summary",
  },
  {
    lessonId: "lesson_nat_pat_and_the_complete_internet_packet_journey", itemPrefix: "nat_pat",
    interactiveAnchors: ["account-pat-journey", "account-mapping-lab", "account-troubleshooting-lab"],
    interactiveItemIds: {
      "account-pat-journey": "nat_pat_interactive_journey",
      "account-mapping-lab": "nat_pat_mapping_lab",
      "account-troubleshooting-lab": "nat_pat_troubleshooting_lab",
    },
    knowledgeCheckCount: 5,
    knowledgeCheckItemIds: ["nat_pat_check_public_1", "nat_pat_check_public_2", "nat_pat_check_account_1", "nat_pat_check_account_2", "nat_pat_check_account_3"],
    knowledgeAnchor: "account-knowledge-checks",
    knowledgeAnchors: ["public-knowledge-check", "account-knowledge-checks"],
  },
  {
    lessonId: "lesson_systematic_network_troubleshooting_capstone", itemPrefix: "capstone",
    interactiveAnchors: ["guided-branch-incident"],
    interactiveItemIds: { "guided-branch-incident": "capstone_guided_incident" },
    knowledgeCheckCount: 3,
    knowledgeAnchor: "final-knowledge-check",
    extraItems: [
      { itemId: "capstone_guided_vlan_check", kind: "interactive", label: "Diagnose the VLAN fault", anchor: "guided-vlan-check", required: false },
      { itemId: "capstone_guided_route_check", kind: "interactive", label: "Diagnose the routing fault", anchor: "guided-route-check", required: false },
      { itemId: "capstone_guided_dns_check", kind: "interactive", label: "Diagnose the DNS fault", anchor: "guided-dns-check", required: false },
      { itemId: "capstone_restoration_verification", kind: "interactive", label: "Verify end-to-end restoration", anchor: "restoration-verification", required: false },
      { itemId: "capstone_pro_evidence", kind: "interactive", label: "Pro sparse-evidence incident", anchor: "pro-sparse-incident", required: false },
      { itemId: "capstone_pro_validation", kind: "interactive", label: "Pro packet and RFC validation", anchor: "pro-advanced-validation", required: false },
      { itemId: "capstone_pro_report", kind: "interactive", label: "Pro incident report", anchor: "pro-incident-report", required: false },
    ],
  },
  { lessonId: "lesson_routing_fundamentals", interactiveAnchors: ["interactive-route-selection"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_rip", interactiveAnchors: ["interactive-rip-exchange"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_ospf", interactiveAnchors: ["interactive-ospf-adjacency"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_eigrp", interactiveAnchors: ["interactive-eigrp-dual"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
  { lessonId: "lesson_bgp", interactiveAnchors: ["interactive-bgp-session-establishment"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" },
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
    required: false,
  };
}

function interactiveItem(
  lessonId: string,
  section: LessonSection,
  prefix = itemPrefix(lessonId),
  stripAnchorPrefix = false,
  itemIdOverride?: string,
): ProgressManifestItem {
  const anchorPart = stripAnchorPrefix ? section.id.replace(/^interactive-(?:dns-)?/, "") : section.id;
  return {
    itemId: itemIdOverride ?? `${prefix}_interactive_${anchorPart.replaceAll("-", "_")}`,
    kind: "interactive",
    label: section.label,
    anchor: section.id,
    required: false,
  };
}

function buildItems(
  lessonId: string,
  sections: readonly LessonSection[],
  definition: LessonProgressDefinition,
) {
  const prefix = definition.itemPrefix ?? itemPrefix(lessonId);
  const items = sections
    .filter(({ access, id }) => access !== "pro" && !(definition.knowledgeAnchors ?? [definition.knowledgeAnchor]).includes(id) && !definition.excludedAnchors?.includes(id))
    .map((section) => definition.interactiveAnchors.includes(section.id)
      ? interactiveItem(lessonId, section, prefix, definition.stripInteractiveAnchorPrefix, definition.interactiveItemIds?.[section.id])
      : sectionItem(lessonId, section, prefix));

  if (definition.knowledgeAnchor) {
    for (let index = 1; index <= definition.knowledgeCheckCount; index += 1) {
      items.push({
        itemId: definition.knowledgeCheckItemIds?.[index - 1] ?? `${prefix}_check_${index}`,
        kind: "knowledge_check",
        label: `Knowledge check ${index}`,
        anchor: `${prefix.replaceAll("_", "-")}-check-${index}`,
        required: true,
      });
    }
  }

  return [...items, ...(definition.extraItems ?? [])];
}

function createManifests() {
  const lessonsByPathway = pathways.flatMap((pathway) =>
    pathway.modules
      .flatMap(({ lessons: moduleLessons }) => moduleLessons)
      .map((lesson) => ({ pathwayId: pathway.id, lesson })));

  return definitions.map((definition) => {
    const match = lessonsByPathway.find(({ lesson }) => lesson.id === definition.lessonId);
    if (!match?.lesson.published) {
      throw new Error(`Published lesson not found for progress: ${definition.lessonId}`);
    }

    return parseLessonProgressManifest({
      pathwayId: match.pathwayId,
      lessonId: match.lesson.id,
      contentVersion: 1,
      items: buildItems(match.lesson.id, match.lesson.sections ?? [], definition),
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
