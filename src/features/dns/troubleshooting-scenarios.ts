import { type DnsIncident, parseDnsIncident } from "./dns.schema";

const incidents = [
  {
    id: "nxdomain-vs-nodata", title: "NXDOMAIN versus NODATA", access: "public",
    evidence: ["RCODE is NOERROR", "ANCOUNT is 0", "Authority contains the zone SOA"],
    choices: ["The name exists but has no record of the requested type", "The queried name does not exist", "The resolver timed out"], correctIndex: 0,
    diagnosis: "NOERROR/NODATA", explanation: "NOERROR with no requested-type answer and authoritative SOA evidence means the name can exist without that record type.",
    responsibleRole: "authoritative", nextStep: "Query another known type or inspect the authoritative zone data.",
  },
  {
    id: "resolver-timeout", title: "Recursive resolver timeout", access: "account", evidence: ["The client retransmits", "No DNS response packet arrives"],
    choices: ["Transport timeout", "NXDOMAIN response", "NOERROR/NODATA"], correctIndex: 0, diagnosis: "Transport timeout",
    explanation: "No DNS response arrived, so there is no RCODE to interpret.", responsibleRole: "recursive", nextStep: "Test reachability and UDP/TCP port 53 to the configured resolver.",
  },
  {
    id: "valid-ttl", title: "Cached answer within TTL", access: "account", evidence: ["Original TTL 300", "Remaining TTL 87"],
    choices: ["The cache entry is still valid", "The resolver must refresh immediately", "The response is NXDOMAIN"], correctIndex: 0,
    diagnosis: "Valid cached data", explanation: "A positive remaining TTL permits the resolver to reuse the cached record.", responsibleRole: "recursive", nextStep: "Compare the answer again after expiry if current authoritative data must be observed.",
  },
  {
    id: "bad-delegation", title: "Incorrect delegation", access: "account", evidence: ["Parent NS names do not match the child authority", "Authoritative answer never arrives"],
    choices: ["Delegation mismatch", "Client ARP failure", "Valid negative cache"], correctIndex: 0, diagnosis: "Delegation mismatch",
    explanation: "The parent points the resolver toward servers that are not authoritative for the child zone.", responsibleRole: "tld", nextStep: "Compare parent delegation with the child's authoritative NS set.",
  },
  {
    id: "recursion-refused", title: "Recursion refused", access: "account", evidence: ["QR=1", "RCODE=REFUSED", "RA=0"],
    choices: ["The server refused recursive service", "The name is absent", "UDP was truncated"], correctIndex: 0, diagnosis: "Recursion refused",
    explanation: "The server replied but declined the requested operation; this is not a timeout or NXDOMAIN.", responsibleRole: "recursive", nextStep: "Use the intended recursive resolver or correct its client-access policy.",
  },
  {
    id: "tcp-fallback", title: "Successful TCP fallback", access: "account", evidence: ["UDP response TC=1", "A TCP port 53 exchange follows", "Complete answer arrives"],
    choices: ["Expected truncation fallback", "DNS server failure", "Negative caching"], correctIndex: 0, diagnosis: "Expected truncation fallback",
    explanation: "TC=1 signals that the UDP response is incomplete and the resolver obtains the full answer over TCP.", responsibleRole: "recursive", nextStep: "Confirm both UDP and TCP port 53 remain permitted.",
  },
  {
    id: "tcp-blocked", title: "TCP fallback blocked", access: "account", evidence: ["UDP response TC=1", "TCP SYN receives no reply"],
    choices: ["TCP port 53 is blocked", "The answer is NODATA", "The TTL is still valid"], correctIndex: 0, diagnosis: "TCP port 53 is blocked",
    explanation: "The resolver receives truncation but cannot complete the required TCP exchange.", responsibleRole: "recursive", nextStep: "Test and permit TCP port 53 along the resolver-to-server path.",
  },
  {
    id: "broken-cname-target", title: "Unresolvable CNAME target", access: "account", evidence: ["Alias CNAME is returned", "The canonical target returns NXDOMAIN"],
    choices: ["The alias target cannot be resolved", "The alias already contains an address", "The query timed out"], correctIndex: 0, diagnosis: "Broken CNAME target",
    explanation: "A CNAME names another owner; it does not supply address data when that target cannot be resolved.", responsibleRole: "authoritative", nextStep: "Correct the target name or publish the target's address record.",
  },
] as const;

export const dnsIncidents: readonly DnsIncident[] = incidents.map(parseDnsIncident);
