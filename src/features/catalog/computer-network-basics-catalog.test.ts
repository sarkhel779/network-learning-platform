import { describe, expect, it } from "vitest";

import { getPathway } from "./catalog.repository";

describe("Computer Network Basics catalogue", () => {
  it("publishes the approved nine beginner lessons in order", () => {
    const pathway = getPathway("networking-foundations");
    const basicsModule = pathway.modules.find(({ id }) => id === "module_network_and_device_essentials");

    expect(basicsModule).toMatchObject({
      slug: "computer-network-basics",
      title: "Computer Network Basics",
    });
    expect(basicsModule?.lessons.map(({ id }) => id)).toEqual([
      "lesson_how_networks_communicate",
      "lesson_hosts_and_network_devices",
      "lesson_hubs",
      "lesson_bridges",
      "lesson_switches",
      "lesson_routers_default_gateways_and_network_boundaries",
      "lesson_physical_and_logical_addressing",
      "lesson_osi_and_tcp_ip_models",
      "lesson_computer_network_basics_final_quiz",
    ]);
    expect(basicsModule?.lessons.map(({ estimatedMinutes }) => estimatedMinutes)).toEqual([
      12, 15, 8, 10, 12, 12, 15, 18, 12,
    ]);
    expect(basicsModule?.lessons.slice(0, 8).every(({ sections }) =>
      sections?.every(({ access }) => access === "public"),
    )).toBe(true);
    expect(basicsModule?.lessons.at(-1)).toMatchObject({ format: "assessment" });

    const hostsLesson = basicsModule?.lessons.find(({ id }) => id === "lesson_hosts_and_network_devices");
    expect(hostsLesson?.sections?.map(({ id }) => id)).toEqual([
      "what-makes-a-device-a-host",
      "network-interfaces",
      "clients-and-servers",
      "follow-host-conversations",
      "one-host-more-than-one-role",
      "classify-host-roles",
      "knowledge-check",
    ]);
  });

  it("relocates existing lessons without changing their stable routes", () => {
    const pathway = getPathway("networking-foundations");
    const ethernet = pathway.modules.find(({ id }) => id === "module_ethernet_switching_and_local_networks");
    const internet = pathway.modules.find(({ id }) => id === "module_nat_and_internet_communication");

    expect(ethernet?.lessons.slice(0, 2).map(({ id, slug }) => [id, slug])).toEqual([
      ["lesson_cables_fibre_wireless_and_network_connections", "cables-fibre-wireless-and-network-connections"],
      ["lesson_unicast_broadcast_and_multicast_communication", "unicast-broadcast-and-multicast-communication"],
    ]);
    expect(internet?.lessons[0]).toMatchObject({
      id: "lesson_access_points_modems_onts_and_firewalls",
      slug: "access-points-modems-onts-and-firewalls",
    });
    expect(internet?.lessons.at(-1)).toMatchObject({
      id: "lesson_first_packet_journey_through_a_small_network",
      slug: "first-packet-journey-through-a-small-network",
    });
  });
});
