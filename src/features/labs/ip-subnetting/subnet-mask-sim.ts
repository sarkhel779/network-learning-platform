import { subnetMaskRounds } from "./subnet-mask-rounds";
import type { BlockSegment, SubnetBlockConfig, SubnetHop } from "./subnet-block-types";

const visuals: { totalUnits: number; segments: BlockSegment[] }[] = [
  {
    totalUnits: 64,
    segments: [
      { start: 0, end: 0, label: "Network", role: "network" },
      { start: 1, end: 62, label: "62 usable", role: "usable" },
      { start: 63, end: 63, label: "Broadcast", role: "broadcast" },
    ],
  },
  {
    totalUnits: 16,
    segments: [
      { start: 0, end: 0, label: "Network", role: "network" },
      { start: 1, end: 14, label: "14 usable", role: "usable" },
      { start: 15, end: 15, label: "Broadcast", role: "broadcast" },
    ],
  },
  {
    totalUnits: 4,
    segments: [
      { start: 0, end: 0, label: "Network", role: "network" },
      { start: 1, end: 2, label: "2 usable", role: "usable" },
      { start: 3, end: 3, label: "Broadcast", role: "broadcast" },
    ],
  },
  {
    totalUnits: 256,
    segments: [
      { start: 0, end: 63, label: "Subnet 1 (62 hosts)", role: "allocated" },
      { start: 64, end: 127, label: "Subnet 2 (62 hosts)", role: "allocated" },
      { start: 128, end: 191, label: "Subnet 3 (62 hosts)", role: "allocated" },
      { start: 192, end: 255, label: "Subnet 4 (62 hosts)", role: "allocated" },
    ],
  },
];

const hops: SubnetHop[] = subnetMaskRounds.map((round, index) => ({ ...round, ...visuals[index] }));

export const subnetMaskSim: SubnetBlockConfig = {
  title: "Find the subnet mask",
  ariaLabel: "A block diagram showing the network, usable host, and broadcast portions of the chosen subnet mask",
  barMode: "replace",
  intro: "Given a requirement, pick the mask that fits it — then watch the block diagram show exactly how that mask carves up the address space.",
  hops,
  completionMessage: "Every mask trades subnet count against host capacity: borrowing more bits for subnets always shrinks what's left for hosts, and vice versa.",
};
