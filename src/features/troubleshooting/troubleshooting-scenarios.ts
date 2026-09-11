import {
  troubleshootingScenarioSchema,
  type TroubleshootingScenario,
  type TroubleshootingScenarioInput,
} from "./troubleshooting-scenario.schema";

const topology = {
  nodes: [
    { id: "branch-client", label: "Branch client", kind: "client" as const },
    { id: "access-switch", label: "Access switch", kind: "switch" as const },
    { id: "branch-router", label: "Branch router", kind: "router" as const },
    { id: "edge-firewall", label: "Edge firewall", kind: "firewall" as const },
    { id: "dns-resolver", label: "DNS resolver", kind: "resolver" as const },
    { id: "portal-server", label: "Portal server", kind: "server" as const },
  ],
  links: [
    { id: "client-access", from: "branch-client", to: "access-switch", fromInterface: "eth0", toInterface: "Gi1/0/18" },
    { id: "access-router", from: "access-switch", to: "branch-router", fromInterface: "Gi1/0/48", toInterface: "Gi0/0" },
    { id: "router-firewall", from: "branch-router", to: "edge-firewall", fromInterface: "Gi0/1", toInterface: "inside" },
    { id: "firewall-dns", from: "edge-firewall", to: "dns-resolver", fromInterface: "dmz", toInterface: "eth0" },
    { id: "firewall-portal", from: "edge-firewall", to: "portal-server", fromInterface: "outside", toInterface: "eth0" },
  ],
};

function parse(input: TroubleshootingScenarioInput): TroubleshootingScenario {
  return troubleshootingScenarioSchema.parse(input);
}

export const guidedBranchPortalIncident = parse({
  id: "guided-branch-portal",
  title: "Restore the branch portal",
  topology,
  faults: [
    { id: "wrong-access-vlan", title: "Wrong access VLAN", explanation: "The client port is assigned to VLAN 30 instead of VLAN 20.", unlocksFaultId: "wrong-specific-route" },
    { id: "wrong-specific-route", title: "Wrong more-specific route", explanation: "A more-specific route sends portal traffic to the wrong next hop.", unlocksFaultId: "stale-portal-dns" },
    { id: "stale-portal-dns", title: "Stale portal DNS", explanation: "The resolver still returns the retired portal address." },
  ],
  hypotheses: [
    { id: "guided-vlan", label: "The access port is in the wrong VLAN", faultId: "wrong-access-vlan", predictions: [{ id: "wrong-vlan", label: "The switchport VLAN differs from the client subnet.", supportingTestIds: ["inspect-vlan"] }] },
    { id: "guided-route", label: "A more-specific route overrides the correct path", faultId: "wrong-specific-route", predictions: [{ id: "unexpected-next-hop", label: "Route lookup selects the retired WAN next hop.", supportingTestIds: ["inspect-route"] }] },
    { id: "guided-dns", label: "The resolver has stale portal data", faultId: "stale-portal-dns", predictions: [{ id: "retired-address", label: "DNS returns the old server address.", supportingTestIds: ["inspect-dns"] }] },
  ],
  tests: [
    { id: "inspect-addressing", label: "Inspect client addressing", command: "ipconfig /all", risk: "read-only", timeCost: 1, evidence: { kind: "cli", title: "Client configuration", body: "10.20.20.42/24, gateway 10.20.20.1, DNS 10.20.50.53" } },
    { id: "inspect-arp", label: "Inspect neighbor cache", command: "arp -a", risk: "read-only", timeCost: 1, evidence: { kind: "table", title: "ARP cache", body: "10.20.20.1 resolves to the branch-router MAC." } },
    { id: "inspect-vlan", label: "Inspect client switchport", command: "show interfaces Gi1/0/18 switchport", risk: "read-only", timeCost: 2, expectedFaultId: "wrong-access-vlan", evidence: { kind: "cli", title: "Switchport state", body: "Administrative access VLAN: 30; expected VLAN: 20." } },
    { id: "inspect-route", label: "Look up the portal route", command: "show ip route 203.0.113.80", risk: "read-only", timeCost: 2, expectedFaultId: "wrong-specific-route", evidence: { kind: "table", title: "Route selection", body: "203.0.113.80/32 via 10.20.99.1 overrides the valid /24 path." } },
    { id: "inspect-dns", label: "Resolve the portal name", command: "nslookup portal.example.test", risk: "read-only", timeCost: 1, expectedFaultId: "stale-portal-dns", evidence: { kind: "observation", title: "Resolver answer", body: "portal.example.test returns retired address 203.0.113.70 instead of 203.0.113.80." } },
    { id: "verify-tls-test", label: "Verify TLS handshake", command: "curl -Iv https://portal.example.test", risk: "read-only", timeCost: 2, phase: "restoration", evidence: { kind: "log", title: "TLS result", body: "TLS 1.3 handshake succeeds and the certificate name matches." } },
    { id: "verify-http-test", label: "Verify portal response", command: "curl -I https://portal.example.test/health", risk: "read-only", timeCost: 1, phase: "restoration", evidence: { kind: "observation", title: "HTTP result", body: "HTTP/2 200 OK from the active portal." } },
  ],
  remediations: [
    { id: "fix-vlan", label: "Move Gi1/0/18 to VLAN 20", faultId: "wrong-access-vlan", requiresTestIds: ["inspect-vlan"], timeCost: 3 },
    { id: "remove-route", label: "Remove the stale /32 route", faultId: "wrong-specific-route", requiresTestIds: ["inspect-route"], timeCost: 3 },
    { id: "refresh-dns", label: "Update and flush the portal record", faultId: "stale-portal-dns", requiresTestIds: ["inspect-dns"], timeCost: 3 },
  ],
  restorationChecks: [
    { id: "verify-addressing", label: "Addressing is correct", testId: "inspect-addressing" },
    { id: "verify-arp", label: "Gateway adjacency resolves", testId: "inspect-arp" },
    { id: "verify-vlan", label: "Access VLAN is correct", testId: "inspect-vlan" },
    { id: "verify-route", label: "Portal route is correct", testId: "inspect-route" },
    { id: "verify-dns", label: "DNS returns the active portal", testId: "inspect-dns" },
    { id: "verify-tls", label: "TLS handshake succeeds", testId: "verify-tls-test" },
    { id: "verify-http", label: "Portal returns HTTP 200", testId: "verify-http-test" },
  ],
});

export const proBranchPortalIncident = parse({
  id: "pro-branch-portal",
  title: "Pro incident: intermittent branch portal",
  topology,
  faults: [
    { id: "asymmetric-stateful-return", title: "Asymmetric stateful return", explanation: "Return traffic bypasses the stateful firewall that admitted the outbound flow.", unlocksFaultId: "stale-dns-cache" },
    { id: "stale-dns-cache", title: "Stale client DNS cache", explanation: "The client retains a retired portal address after the authoritative record changes." },
  ],
  hypotheses: [
    { id: "pro-asymmetry", label: "The forward and return paths cross different stateful devices", faultId: "asymmetric-stateful-return", predictions: [{ id: "syn-no-synack", label: "Repeated SYN packets leave, but the expected SYN-ACK never returns on the same path.", supportingTestIds: ["capture-flow", "compare-paths", "inspect-firewall-log"] }] },
    { id: "pro-cache", label: "The client DNS cache is stale", faultId: "stale-dns-cache", predictions: [{ id: "cache-disagrees", label: "Client cache and authoritative answer disagree.", supportingTestIds: ["compare-dns"] }] },
    { id: "pro-interface", label: "An interface duplex mismatch causes loss", faultId: "asymmetric-stateful-return", predictions: [{ id: "interface-errors", label: "Interface counters would show errors or late collisions.", supportingTestIds: [] }] },
  ],
  tests: [
    { id: "capture-flow", label: "Inspect the firewall capture", command: "capture portal-flow match tcp host 203.0.113.80 eq 443", risk: "read-only", timeCost: 3, expectedFaultId: "asymmetric-stateful-return", evidence: { kind: "capture", title: "TCP flow", body: "SYN retransmission repeats without a SYN-ACK on the stateful return path." } },
    { id: "compare-paths", label: "Compare forward and return routing", command: "show route 203.0.113.80; show route 10.20.20.42", risk: "read-only", timeCost: 3, expectedFaultId: "asymmetric-stateful-return", evidence: { kind: "table", title: "Path comparison", body: "Forward traffic crosses edge-firewall; return traffic selects the branch-router bypass." } },
    { id: "inspect-firewall-log", label: "Inspect stateful firewall logs", risk: "read-only", timeCost: 2, expectedFaultId: "asymmetric-stateful-return", evidence: { kind: "log", title: "Firewall session log", body: "Outbound SYN admitted; session ages out with zero return bytes." } },
    { id: "compare-dns", label: "Compare cached and authoritative DNS", command: "ipconfig /displaydns; nslookup portal.example.test 10.20.50.53", risk: "read-only", timeCost: 2, expectedFaultId: "stale-dns-cache", evidence: { kind: "cli", title: "DNS comparison", body: "Client cache returns 203.0.113.70; resolver returns 203.0.113.80." } },
    { id: "check-interfaces", label: "Check interface health", command: "show interfaces counters errors", risk: "read-only", timeCost: 1, evidence: { kind: "observation", title: "Interface counters", body: "No CRC, collision, duplex, or discard anomalies are present." } },
    { id: "pro-verify-http", label: "Verify restored portal", command: "curl -I https://portal.example.test/health", risk: "read-only", timeCost: 1, phase: "restoration", evidence: { kind: "observation", title: "Service verification", body: "HTTP/2 200 OK over a symmetric stateful path." } },
  ],
  remediations: [
    { id: "fix-return-path", label: "Restore symmetric return routing", faultId: "asymmetric-stateful-return", requiresTestIds: ["capture-flow", "compare-paths"], timeCost: 5 },
    { id: "flush-client-dns", label: "Flush the stale client DNS cache", faultId: "stale-dns-cache", requiresTestIds: ["compare-dns"], timeCost: 2 },
  ],
  restorationChecks: [
    { id: "verify-stateful-path", label: "Forward and return paths are symmetric", testId: "compare-paths" },
    { id: "verify-client-dns", label: "Client and resolver answers agree", testId: "compare-dns" },
    { id: "verify-pro-http", label: "Portal service is restored", testId: "pro-verify-http" },
  ],
});

export const troubleshootingScenarios = [guidedBranchPortalIncident, proBranchPortalIncident];
