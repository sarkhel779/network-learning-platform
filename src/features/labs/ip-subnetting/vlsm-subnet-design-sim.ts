import { vlsmSubnetDesignRounds } from "./vlsm-subnet-design-rounds";
import type { BlockSegment, SubnetBlockConfig, SubnetHop } from "./subnet-block-types";

const visuals: { totalUnits: number; segments: BlockSegment[] }[] = [
  { totalUnits: 256, segments: [{ start: 0, end: 127, label: "100-host subnet (/25)", role: "allocated" }] },
  { totalUnits: 256, segments: [{ start: 128, end: 191, label: "50-host subnet (/26)", role: "allocated" }] },
  { totalUnits: 256, segments: [{ start: 192, end: 223, label: "20-host subnet (/27)", role: "allocated" }] },
  { totalUnits: 256, segments: [{ start: 224, end: 255, label: "Free / reserved", role: "free" }] },
];

const hops: SubnetHop[] = vlsmSubnetDesignRounds.map((round, index) => ({ ...round, ...visuals[index] }));

export const vlsmSubnetDesignSim: SubnetBlockConfig = {
  title: "VLSM subnet design",
  ariaLabel: "A block diagram of 192.168.1.0/24 filling in with each VLSM allocation as it's carved out",
  barMode: "append",
  intro: "Carve 192.168.1.0/24 into differently-sized subnets with VLSM — largest first — and watch the block diagram fill in with each allocation as you go.",
  hops,
  completionMessage: "The full /24 is now accounted for: a /25 for 100 hosts, a /26 for 50, a /27 for 20, and the remainder left free for whatever comes next — all without a single overlap.",
};
