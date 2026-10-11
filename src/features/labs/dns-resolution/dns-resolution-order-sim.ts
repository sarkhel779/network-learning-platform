import { dnsResolutionOrderRounds } from "./dns-resolution-order-rounds";
import type { DnsHop, DnsJourneyConfig } from "./dns-journey-types";

const activation: { activateSequence: string[] }[] = [
  { activateSequence: ["resolver"] },
  { activateSequence: ["root"] },
  { activateSequence: ["tld", "authoritative"] },
  { activateSequence: ["resolver"] },
];

const hops: DnsHop[] = dnsResolutionOrderRounds.map((round, index) => ({ ...round, ...activation[index] }));

export const dnsResolutionOrderSim: DnsJourneyConfig = {
  title: "DNS resolution order",
  canvasAriaLabel: "A DNS query looping from the host through the resolver, root, TLD, and authoritative servers and back",
  startNodeId: "host",
  nodes: [
    { id: "host", x: 40, y: 210, label: "Host" },
    { id: "resolver", x: 150, y: 80, label: "Resolver", shape: "ellipse" },
    { id: "root", x: 330, y: 30, label: "Root DNS Server" },
    { id: "tld", x: 330, y: 110, label: "Top level Domain Server" },
    { id: "authoritative", x: 330, y: 190, label: "Authoritative domain server" },
  ],
  links: [
    { from: "host", to: "resolver", waypoints: [{ x: 40, y: 210 }, { x: 40, y: 80 }, { x: 110, y: 80 }] },
    { from: "resolver", to: "root", waypoints: [{ x: 190, y: 70 }, { x: 330, y: 50 }] },
    { from: "root", to: "tld", waypoints: [{ x: 330, y: 50 }, { x: 330, y: 90 }] },
    { from: "tld", to: "authoritative", waypoints: [{ x: 330, y: 130 }, { x: 330, y: 170 }] },
    { from: "authoritative", to: "resolver", waypoints: [{ x: 330, y: 190 }, { x: 150, y: 190 }, { x: 150, y: 116 }] },
  ],
  intro: "A host needs to resolve www.example.com and its DNS cache is empty. Walk through where the query actually goes, one hop at a time.",
  hops,
  completionMessage: "The resolver caches the answer for its TTL and hands it back to the host, which can now connect to 93.184.216.34 directly — no DNS lookup needed again until the cache expires.",
};
