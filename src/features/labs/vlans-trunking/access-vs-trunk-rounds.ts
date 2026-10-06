import type { ChallengeRound } from "../challenge-rounds";

export const accessVsTrunkRounds: ChallengeRound[] = [
  {
    prompt: "A switch port connects directly to a single PC. What port mode should it use, and why?",
    options: [
      { id: "correct", label: "Access mode, carrying traffic for exactly one VLAN that the PC belongs to" },
      { id: "trunkall", label: "Trunk mode, so it can carry every VLAN just in case" },
      { id: "accessmulti", label: "Access mode, but only if the PC has multiple network cards" },
      { id: "trunktag", label: "Trunk mode, because PCs require 802.1Q tags to function" },
    ],
    correctId: "correct",
    explanation: "An access port is assigned to a single VLAN and strips/doesn't expect VLAN tags — exactly what a normal end-device like a PC needs. Trunk ports are for links that must carry multiple VLANs, such as between switches.",
  },
  {
    prompt: "Two switches are connected to each other, and devices in VLAN 10 and VLAN 20 exist on both switches. What should the link between the switches be configured as?",
    options: [
      { id: "correct", label: "A trunk port, carrying tagged traffic for both VLAN 10 and VLAN 20 over the single link" },
      { id: "twoaccess", label: "Two separate access ports, one for each VLAN" },
      { id: "accessvlan1", label: "An access port set to VLAN 1 only" },
      { id: "loopback", label: "A loopback interface" },
    ],
    correctId: "correct",
    explanation: "A single switch-to-switch link needs to carry multiple VLANs' worth of traffic. Trunking (802.1Q tagging) lets one physical link carry traffic for many VLANs, each identified by a VLAN tag, rather than needing a separate cable per VLAN.",
  },
  {
    prompt: "What does 802.1Q tagging add to an Ethernet frame on a trunk link?",
    options: [
      { id: "correct", label: "A VLAN ID field, so switches know which VLAN the frame belongs to" },
      { id: "mac2", label: "A second destination MAC address" },
      { id: "encrypt", label: "An encrypted payload" },
      { id: "ipdup", label: "A duplicate IP header" },
    ],
    correctId: "correct",
    explanation: "802.1Q inserts a 4-byte tag containing the VLAN ID into the Ethernet frame header. Switches use this tag to keep each VLAN's traffic logically separated while sharing the same physical trunk link.",
  },
];
