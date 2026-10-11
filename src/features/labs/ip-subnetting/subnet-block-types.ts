export type BlockSegmentRole = "network" | "broadcast" | "usable" | "allocated" | "free";
export type BlockSegment = { start: number; end: number; label: string; role: BlockSegmentRole };
export type SubnetHopOption = { id: string; label: string };

export type SubnetHop = {
  prompt: string;
  detail?: string;
  options: SubnetHopOption[];
  correctId: string;
  explanation: string;
  /** Total address units the bar represents for this hop (e.g. 64 for a /26 block, 256 for a /24). */
  totalUnits: number;
  /** Segments to show once this hop is answered correctly. */
  segments: BlockSegment[];
};

export type SubnetBlockConfig = {
  title: string;
  ariaLabel: string;
  /** "replace": each hop shows its own independent bar. "append": segments accumulate onto one shared bar across hops. */
  barMode: "replace" | "append";
  intro: string;
  hops: SubnetHop[];
  completionMessage: string;
};
