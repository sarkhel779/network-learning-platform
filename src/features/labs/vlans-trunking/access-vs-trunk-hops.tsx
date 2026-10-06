import { HostIcon, SwitchIcon } from "../hop-icons";
import type { HopScenarioData } from "../hop-lab-types";

export const accessVsTrunkScenario: HopScenarioData = {
  topologyAriaLabel: "A frame crossing from an access port, over a trunk, to another access port",
  devices: [
    { id: "hostA", label: "Host A", sublabel: "VLAN 10", icon: <HostIcon /> },
    { id: "switchA", label: "Switch A", icon: <SwitchIcon /> },
    { id: "switchB", label: "Switch B", icon: <SwitchIcon /> },
    { id: "hostB", label: "Host B", sublabel: "VLAN 10", icon: <HostIcon /> },
  ],
  steps: [
    {
      fromId: "hostA", toId: "switchA",
      title: "Frame enters an access port",
      explanation: "Host A's access port is assigned to VLAN 10. The frame arrives untagged — access ports don't use 802.1Q tags at all.",
      fields: [{ label: "Port type", value: "Access (VLAN 10)" }, { label: "Tag", value: "None (untagged)" }],
    },
    {
      fromId: "switchA", toId: "switchB",
      title: "Switch tags the frame for the trunk",
      explanation: "To cross the switch-to-switch link, Switch A adds an 802.1Q tag identifying VLAN 10, so Switch B knows which VLAN this frame belongs to.",
      fields: [{ label: "Port type", value: "Trunk" }, { label: "Tag", value: "802.1Q VLAN 10" }],
    },
    {
      fromId: "switchB", toId: "hostB",
      title: "Switch strips the tag for the access port",
      explanation: "Switch B removes the VLAN tag before delivering the frame out its access port to Host B — access ports never see tags, incoming or outgoing.",
      fields: [{ label: "Port type", value: "Access (VLAN 10)" }, { label: "Tag", value: "None (untagged)" }],
      outcome: "delivered",
    },
  ],
  quiz: {
    question: "Why does the frame arrive at Host B with no VLAN tag, even though it was tagged while crossing the trunk?",
    options: [
      { id: "correct", label: "Access ports always send and receive untagged frames — tagging only happens on the trunk in between" },
      { id: "onehop", label: "VLAN tags are automatically removed after exactly one hop" },
      { id: "nic", label: "Host B's network card strips the tag itself" },
      { id: "evenonly", label: "Tags are only added for even-numbered VLANs" },
    ],
    correctId: "correct",
    feedbackCorrect: "Correct. Tagging is purely a trunk-link mechanism for keeping VLANs apart while sharing one cable. Access ports, by design, only ever send and receive untagged frames.",
    feedbackIncorrect: "Not quite. The tag exists only to let the trunk link carry multiple VLANs at once. Access ports are always untagged, on both the sending and receiving end.",
  },
};
