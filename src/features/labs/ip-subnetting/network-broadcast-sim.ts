import { networkBroadcastRounds } from "./network-broadcast-rounds";
import type { BlockSegment, SubnetBlockConfig, SubnetHop } from "./subnet-block-types";

const visuals: { totalUnits: number; segments: BlockSegment[] }[] = [
  {
    totalUnits: 256,
    segments: [
      { start: 0, end: 63, label: "Other block .0–.63", role: "free" },
      { start: 64, end: 64, label: "Network .64", role: "network" },
      { start: 65, end: 126, label: "Usable", role: "usable" },
      { start: 127, end: 127, label: "Broadcast .127", role: "broadcast" },
      { start: 128, end: 191, label: "Other block .128–.191", role: "free" },
      { start: 192, end: 255, label: "Other block .192–.255", role: "free" },
    ],
  },
  {
    totalUnits: 48,
    segments: [
      { start: 0, end: 15, label: "Prev block .176–.191", role: "free" },
      { start: 16, end: 16, label: "Network .192", role: "network" },
      { start: 17, end: 30, label: "Usable", role: "usable" },
      { start: 31, end: 31, label: "Broadcast .207", role: "broadcast" },
      { start: 32, end: 47, label: "Next block .208–.223", role: "free" },
    ],
  },
  {
    totalUnits: 256,
    segments: [
      { start: 0, end: 127, label: "Other half .0–.127", role: "free" },
      { start: 128, end: 128, label: "Network .128", role: "network" },
      { start: 129, end: 254, label: "Usable", role: "usable" },
      { start: 255, end: 255, label: "Broadcast .255", role: "broadcast" },
    ],
  },
  {
    totalUnits: 12,
    segments: [
      { start: 0, end: 3, label: "Prev block .4–.7", role: "free" },
      { start: 4, end: 4, label: "Network .8", role: "network" },
      { start: 5, end: 6, label: "Usable", role: "usable" },
      { start: 7, end: 7, label: "Broadcast .11", role: "broadcast" },
      { start: 8, end: 11, label: "Next block .12–.15", role: "free" },
    ],
  },
];

const hops: SubnetHop[] = networkBroadcastRounds.map((round, index) => ({ ...round, ...visuals[index] }));

export const networkBroadcastSim: SubnetBlockConfig = {
  title: "Identify network & broadcast",
  ariaLabel: "A block diagram showing which address block a given IP falls into, alongside its neighboring blocks",
  barMode: "replace",
  intro: "Given an address and mask, find its network and broadcast addresses — then see exactly which block it falls into, right next to the neighboring blocks it's easy to mistake it for.",
  hops,
  completionMessage: "Every address belongs to exactly one block of its mask's size. Find the block boundary below the given address, and the one above it, and you have the network and broadcast addresses.",
};
