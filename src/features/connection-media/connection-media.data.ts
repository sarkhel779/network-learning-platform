import type { ConnectionMedium } from "./connection-media.schema";

export const publicConnectionMedia: readonly ConnectionMedium[] = [
  {
    id: "copper",
    name: "Copper",
    signalLabel: "Electrical pulses",
    summary: "Twisted-pair Ethernet carries bits as changing electrical signals through a copper cable.",
    analogy: "Like a dedicated lane between two nearby places: dependable when the lane is short and in good condition.",
    qualities: {
      distance: { label: "Distance", explanation: "Common twisted-pair Ethernet channels are intended for nearby runs, typically up to 100 metres." },
      bandwidth: { label: "Bandwidth", explanation: "Copper Ethernet can provide useful high-speed links when cable category and equipment support the negotiated rate." },
      interference: { label: "Interference", explanation: "Electrical signals can be affected by electromagnetic interference, so routing and installation matter." },
      mobility: { label: "Mobility", explanation: "A cable keeps a fixed device reliably connected but does not support movement while in use." },
      cost: { label: "Cost", explanation: "Familiar ports, cable, and installation often make nearby copper connections economical." },
    },
  },
  {
    id: "fibre",
    name: "Fibre",
    signalLabel: "Light pulses",
    summary: "Fibre carries bits as pulses of light through glass or plastic strands.",
    analogy: "Like sending a precise flash of light through a protected tunnel over a long route.",
    qualities: {
      distance: { label: "Distance", explanation: "Fibre is well suited to links that exceed the practical distance of common copper Ethernet." },
      bandwidth: { label: "Bandwidth", explanation: "Fibre supports high-capacity links when the optics and equipment on both ends are compatible." },
      interference: { label: "Interference", explanation: "Light in fibre is not affected by electromagnetic interference from nearby machinery." },
      mobility: { label: "Mobility", explanation: "Fibre is a fixed link and needs careful handling rather than supporting moving endpoints." },
      cost: { label: "Cost", explanation: "Optics, compatible equipment, and installation can raise the initial cost while enabling longer links." },
    },
  },
  {
    id: "wireless",
    name: "Wireless",
    signalLabel: "Radio waves",
    summary: "Wireless carries bits as radio signals through a shared area instead of a cable.",
    analogy: "Like taking turns in a shared conversation: convenient for movement, but affected by the room and other talkers.",
    qualities: {
      distance: { label: "Distance", explanation: "Wireless range changes with walls, obstructions, antenna placement, and signal strength." },
      bandwidth: { label: "Bandwidth", explanation: "Wireless capacity is shared airtime, so useful throughput depends on signal quality and other active devices." },
      interference: { label: "Interference", explanation: "A shared radio environment can introduce congestion and interference from nearby networks or equipment." },
      mobility: { label: "Mobility", explanation: "Wireless lets a compatible device move within coverage without carrying a physical cable." },
      cost: { label: "Cost", explanation: "Wireless can avoid running a cable to each mobile device, but coverage and capacity still need planning." },
    },
  },
];
