import type { ChallengeRound } from "../challenge-rounds";

export const nativeVlanMismatchRounds: ChallengeRound[] = [
  {
    prompt: "Switch A's trunk port has native VLAN 1. Switch B's trunk port, on the same link, has native VLAN 99. What's the main risk of this mismatch?",
    options: [
      { id: "correct", label: "Untagged traffic from each switch's native VLAN gets interpreted as belonging to the other switch's native VLAN, potentially leaking traffic between VLANs" },
      { id: "linkdown", label: "The trunk link will refuse to come up at all" },
      { id: "onlyvlan1", label: "Only VLAN 1 traffic will be affected; every other VLAN is unaffected" },
      { id: "autofix", label: "Switches will automatically renumber one of the VLANs to match" },
    ],
    correctId: "correct",
    explanation: "The native VLAN is the one VLAN whose traffic is sent untagged on a trunk. If the two ends disagree on which VLAN that is, untagged frames get associated with the wrong VLAN on the receiving end — a classic VLAN-hopping risk and a common cause of mismatch warnings in switch logs.",
  },
  {
    prompt: "You see a log message about a native VLAN mismatch between two switches. What should you check first?",
    options: [
      { id: "correct", label: "That both ends of the trunk link are configured with the same native VLAN" },
      { id: "hostname", label: "That both switches have the same hostname" },
      { id: "cable", label: "That the cable is shorter than 100 meters" },
      { id: "stp", label: "That spanning-tree is disabled on both switches" },
    ],
    correctId: "correct",
    explanation: "This message specifically flags a native VLAN disagreement between the two connected switches' trunk interfaces — the fix is to make both ends use the same native VLAN, commonly done by explicitly setting it rather than leaving it at the default of VLAN 1.",
  },
  {
    prompt: "Best practice for the native VLAN on trunk links is to:",
    options: [
      { id: "correct", label: "Set it to an unused VLAN ID not assigned to any access ports, reducing the risk of VLAN hopping" },
      { id: "vlan1", label: "Always leave it as VLAN 1, the factory default" },
      { id: "mosthosts", label: "Set it to match whichever VLAN has the most hosts" },
      { id: "disable", label: "Disable the native VLAN entirely" },
    ],
    correctId: "correct",
    explanation: "Using a dedicated, otherwise-unused VLAN as the native VLAN — rather than the default VLAN 1, which is often enabled everywhere — limits the blast radius if a VLAN-hopping attack or misconfiguration does occur.",
  },
];
