import type { SwitchingComparisonDevice } from "./switching.schema";

export const publicSwitchingComparison: readonly SwitchingComparisonDevice[] = [
  {
    id: "hub",
    name: "Hub",
    summary: "Hub repeats the incoming physical signal toward every other port and does not inspect MAC addresses.",
    dimensions: {
      "signal-handling": { label: "Signal handling", behavior: "repeat", explanation: "Repeats the incoming physical signal toward every other port." },
      "collision-scope": { label: "Collision scope", behavior: "repeat", explanation: "All attached devices share one collision domain." },
      "bandwidth-sharing": { label: "Bandwidth sharing", behavior: "repeat", explanation: "Every attached device shares the segment's bandwidth and historic half-duplex access." },
      "address-awareness": { label: "Address awareness", behavior: "repeat", explanation: "Does not inspect MAC addresses or build a forwarding table." },
      "delivery-scope": { label: "Delivery scope", behavior: "flood", explanation: "Repeats the signal to all other ports; endpoint interfaces decide whether to accept the frame." },
    },
  },
  {
    id: "bridge",
    name: "Bridge",
    summary: "A bridge learns source locations and filters traffic between Ethernet segments.",
    dimensions: {
      "signal-handling": { label: "Signal handling", behavior: "segment", explanation: "Receives a frame on one segment before deciding whether another segment needs it." },
      "collision-scope": { label: "Collision scope", behavior: "segment", explanation: "Separates the attached Ethernet segments into different collision domains." },
      "bandwidth-sharing": { label: "Bandwidth sharing", behavior: "segment", explanation: "Traffic local to one segment need not consume capacity on the other segment." },
      "address-awareness": { label: "Address awareness", behavior: "learn", explanation: "Learns each source MAC address on the port where its frame arrived." },
      "delivery-scope": { label: "Delivery scope", behavior: "filter", explanation: "Forwards between segments only when the destination decision requires it." },
    },
  },
  {
    id: "switch",
    name: "Switch",
    summary: "A switch applies learning-bridge behavior across many dedicated Ethernet ports.",
    dimensions: {
      "signal-handling": { label: "Signal handling", behavior: "forward", explanation: "Receives an Ethernet frame, learns its source, and looks up its destination." },
      "collision-scope": { label: "Collision scope", behavior: "segment", explanation: "Each full-duplex switch port normally forms a separate collision domain." },
      "bandwidth-sharing": { label: "Bandwidth sharing", behavior: "forward", explanation: "Each switched link normally has dedicated capacity instead of one shared hub segment." },
      "address-awareness": { label: "Address awareness", behavior: "learn", explanation: "Learns the source MAC on ingress and uses the destination MAC for its decision." },
      "delivery-scope": { label: "Delivery scope", behavior: "forward", explanation: "Known unicast uses one learned port; unknown unicast and broadcast use eligible ports except ingress. The switch remains in the same broadcast domain unless another feature separates it." },
    },
  },
];
