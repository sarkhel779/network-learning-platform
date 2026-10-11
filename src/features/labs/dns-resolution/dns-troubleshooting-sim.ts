import { dnsTroubleshootingRounds } from "./dns-troubleshooting-rounds";
import type { DnsHop, DnsJourneyConfig } from "./dns-journey-types";

const activation: { activateSequence: string[]; blockedAtEnd?: boolean }[] = [
  { activateSequence: ["resolver", "oldServer"] },
  { activateSequence: [] },
  { activateSequence: ["resolver"], blockedAtEnd: true },
];

const hops: DnsHop[] = dnsTroubleshootingRounds.map((round, index) => ({ ...round, ...activation[index] }));

export const dnsTroubleshootingSim: DnsJourneyConfig = {
  title: "DNS troubleshooting",
  canvasAriaLabel: "A client's DNS query being served from a resolver's cache instead of reaching the authoritative server",
  startNodeId: "client",
  nodes: [
    { id: "client", x: 40, y: 130, label: "Client" },
    { id: "resolver", x: 200, y: 130, label: "Resolver", sublabel: "cache", shape: "ellipse" },
    { id: "oldServer", x: 360, y: 55, label: "Old server", sublabel: "stale cached IP" },
    { id: "newServer", x: 360, y: 205, label: "New server", sublabel: "current IP" },
  ],
  links: [
    { from: "client", to: "resolver" },
    { from: "resolver", to: "oldServer" },
    { from: "resolver", to: "newServer" },
  ],
  intro: "www.example.com's A record was just changed to point at a new server, but some users are still landing on the old one. Diagnose why, one question at a time.",
  hops,
  completionMessage: "Both faults here trace back to the same thing: a cache holding onto an answer — positive or negative — until its TTL expires. Planning ahead (lowering TTL before a change) and simply waiting out a stale entry are the two ways out.",
};
