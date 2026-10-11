import { HostIcon, ServerIcon } from "../hop-icons";
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
  nodes: [
    { id: "client", x: 10, y: 50, label: "Client", icon: HostIcon() },
    { id: "dns", x: 48, y: 50, label: "DNS server", sublabel: "example.com zone", icon: ServerIcon() },
    { id: "web", x: 88, y: 22, label: "Web server", icon: ServerIcon() },
    { id: "mail", x: 88, y: 78, label: "Mail server", icon: ServerIcon() },
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
