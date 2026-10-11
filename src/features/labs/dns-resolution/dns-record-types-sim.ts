import { dnsRecordTypesRounds } from "./dns-record-types-rounds";
import type { DnsHop, DnsJourneyConfig } from "./dns-journey-types";

const activation: { activateSequence: string[] }[] = [
  { activateSequence: ["dns", "web"] },
  { activateSequence: ["dns", "web"] },
  { activateSequence: ["dns", "mail"] },
  { activateSequence: ["dns", "client"] },
];

const hops: DnsHop[] = dnsRecordTypesRounds.map((round, index) => ({ ...round, ...activation[index] }));

export const dnsRecordTypesSim: DnsJourneyConfig = {
  title: "DNS record types",
  canvasAriaLabel: "A DNS query being routed to the right destination depending on the record type involved",
  startNodeId: "client",
  nodes: [
    { id: "client", x: 40, y: 130, label: "Client" },
    { id: "dns", x: 200, y: 130, label: "DNS server", sublabel: "example.com zone", shape: "ellipse" },
    { id: "web", x: 360, y: 55, label: "Web server" },
    { id: "mail", x: 360, y: 205, label: "Mail server" },
  ],
  links: [
    { from: "client", to: "dns" },
    { from: "dns", to: "web" },
    { from: "dns", to: "mail" },
  ],
  intro: "example.com's zone file holds several different record types. Each one tells a resolver something different — and sends a query somewhere different.",
  hops,
  completionMessage: "Each record type answers a different question — A/AAAA for an address, CNAME for an alias, MX for mail routing, PTR for a reverse lookup — and the resolver follows whichever chain the query actually needs.",
};
