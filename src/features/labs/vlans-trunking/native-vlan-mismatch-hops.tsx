import { SwitchIcon } from "../hop-icons";
import type { HopScenarioData } from "../hop-lab-types";

export const nativeVlanMismatchScenario: HopScenarioData = {
  topologyAriaLabel: "A trunk link where the two switches disagree on the native VLAN",
  devices: [
    { id: "switchA", label: "Switch A", sublabel: "Native VLAN 1", icon: <SwitchIcon /> },
    { id: "switchB", label: "Switch B", sublabel: "Native VLAN 99", icon: <SwitchIcon /> },
  ],
  steps: [
    {
      fromId: "switchA", toId: "switchB",
      title: "Switch A sends untagged native VLAN traffic",
      explanation: "Switch A's native VLAN is 1, so VLAN 1 traffic crosses the trunk untagged — that's what native VLAN traffic always does, by definition.",
      fields: [{ label: "Native VLAN (Switch A)", value: "1" }, { label: "Tag", value: "None (native)" }],
    },
    {
      fromId: "switchB", toId: null,
      title: "Switch B misinterprets the untagged frame",
      explanation: "Switch B's native VLAN is 99, not 1. Since the frame arrived untagged, Switch B assumes it belongs to its own native VLAN, 99 — the two switches now disagree about which VLAN this traffic is really in, which is exactly how traffic can leak between VLANs.",
      fields: [{ label: "Native VLAN (Switch B)", value: "99" }, { label: "Frame treated as", value: "VLAN 99" }],
    },
  ],
  quiz: {
    question: "What's the real risk created by this native VLAN mismatch?",
    options: [
      { id: "correct", label: "Untagged traffic can leak between VLAN 1 and VLAN 99 — a classic VLAN-hopping risk" },
      { id: "linkdown", label: "The trunk link refuses to pass any traffic at all" },
      { id: "broadcastonly", label: "Only broadcast traffic is affected; everything else is fine" },
      { id: "autofix", label: "Switches automatically correct to whichever VLAN number is lower" },
    ],
    correctId: "correct",
    feedbackCorrect: "Correct. Because the native VLAN is sent untagged, a mismatch means each switch assigns that untagged traffic to a different VLAN — effectively leaking it across the VLAN boundary.",
    feedbackIncorrect: "Not quite. The trunk keeps working; the danger is quieter: untagged native-VLAN traffic ends up associated with two different VLANs depending on which switch is looking at it.",
  },
};
