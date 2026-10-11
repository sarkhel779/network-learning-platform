import { GlobeIcon, HostIcon, ServerIcon } from "../hop-icons";
import { dnsResolutionOrderRounds } from "./dns-resolution-order-rounds";
import type { DnsHop, DnsJourneyConfig } from "./dns-journey-types";

const activation: { activateSequence: string[] }[] = [
  { activateSequence: ["resolver"] },
  { activateSequence: ["root"] },
  { activateSequence: ["tld", "authoritative"] },
  { activateSequence: ["client"] },
];

const hops: DnsHop[] = dnsResolutionOrderRounds.map((round, index) => ({ ...round, ...activation[index] }));

export const dnsResolutionOrderSim: DnsJourneyConfig = {
  title: "DNS resolution order",
  canvasAriaLabel: "A DNS query walking from the client through the resolver, root, TLD, and authoritative servers",
  nodes: [
    { id: "client", x: 8, y: 50, label: "Client", sublabel: "www.example.com?", icon: HostIcon() },
    { id: "resolver", x: 30, y: 50, label: "Resolver", sublabel: "Recursive", icon: ServerIcon() },
    { id: "root", x: 52, y: 50, label: "Root", icon: GlobeIcon() },
    { id: "tld", x: 74, y: 50, label: ".com TLD", icon: ServerIcon() },
    { id: "authoritative", x: 96, y: 50, label: "Authoritative", sublabel: "example.com", icon: ServerIcon() },
  ],
  links: [
    { from: "client", to: "resolver" },
    { from: "resolver", to: "root" },
    { from: "root", to: "tld" },
    { from: "tld", to: "authoritative" },
  ],
  intro: "A client needs to resolve www.example.com and its DNS cache is empty. Walk through where the query actually goes, one hop at a time.",
  hops,
  completionMessage: "The resolver caches the answer for its TTL and hands it back to the client, which can now connect to 93.184.216.34 directly — no DNS lookup needed again until the cache expires.",
};
