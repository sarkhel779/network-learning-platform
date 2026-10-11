import type { ReactNode } from "react";

export type DnsNode = { id: string; x: number; y: number; label: string; sublabel?: string; icon: ReactNode };
export type DnsLink = { from: string; to: string };
export type DnsHopOption = { id: string; label: string };

export type DnsHop = {
  /** Canvas node ids to animate the packet through, in order, once this hop is answered correctly. Empty for a purely conceptual question. */
  activateSequence: string[];
  /** When true, the final node in activateSequence renders as "blocked" instead of "active". */
  blockedAtEnd?: boolean;
  prompt: string;
  options: DnsHopOption[];
  correctId: string;
  explanation: string;
};

export type DnsJourneyConfig = {
  title: string;
  canvasAriaLabel: string;
  nodes: DnsNode[];
  links: DnsLink[];
  intro: string;
  hops: DnsHop[];
  completionMessage: string;
};
