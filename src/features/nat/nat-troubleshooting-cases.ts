export type NatTroubleshootingCase = {
  id: string;
  title: string;
  evidence: string;
  choices: string[];
  correctIndex: number;
  failedAssumption: string;
  explanation: string;
  nextVerification: string;
};

export const natTroubleshootingCases: NatTroubleshootingCase[] = [
  {
    id: "missing-state",
    title: "Reply reaches the gateway but not the client",
    evidence: "WAN capture shows the HTTPS reply; the translation table has no matching public port.",
    choices: ["Missing translation state", "A DNS lookup failure", "A Layer 2 loop"],
    correctIndex: 0,
    failedAssumption: "The return packet cannot be matched without a live reverse mapping.",
    explanation: "The outside tuple arrived, but the gateway no longer knows which private socket owns it.",
    nextVerification: "Inspect the current translation table and timeout counters.",
  },
  {
    id: "wrong-port-forward",
    title: "Published HTTPS service reaches the wrong host",
    evidence: "The DNAT rule for TCP/443 points to 10.0.0.60 instead of 10.0.0.50.",
    choices: ["Incorrect port-forward target", "PAT pool exhaustion", "Normal address aging"], correctIndex: 0,
    failedAssumption: "The public port was assumed to map to the intended private server.", explanation: "DNAT follows the configured target even when the target is wrong.", nextVerification: "Compare the active DNAT rule with the service inventory.",
  },
  {
    id: "pool-exhaustion", title: "New clients cannot obtain a public mapping", evidence: "Every address in the dynamic NAT pool is allocated.",
    choices: ["Dynamic pool exhaustion", "Wrong default gateway", "Hairpin response"], correctIndex: 0, failedAssumption: "A free global address was assumed to exist.", explanation: "Dynamic one-to-one NAT cannot create another binding after its pool is consumed.", nextVerification: "Count active bindings and available pool addresses.",
  },
  {
    id: "pat-collision", title: "Two flows request the same translated port", evidence: "The requested public tuple is already owned by another inside socket.",
    choices: ["PAT must choose another port", "Both flows share one tuple", "Disable checksums"], correctIndex: 0, failedAssumption: "A translated five-tuple was assumed to be reusable.", explanation: "PAT preserves uniqueness by selecting a different available source port.", nextVerification: "Compare the protocol, inside sockets, and assigned global ports.",
  },
  {
    id: "expired-timeout", title: "An idle flow stops receiving replies", evidence: "The mapping aged out before the next server packet arrived.",
    choices: ["Translation timeout expired", "Static route disappeared", "Server changed VLAN"], correctIndex: 0, failedAssumption: "The idle mapping was assumed to remain active indefinitely.", explanation: "Dynamic state expires, so a late reply has no reverse owner.", nextVerification: "Check protocol-specific idle timers and keepalive behavior.",
  },
  {
    id: "asymmetric-routing", title: "Forward and return paths use different gateways", evidence: "The request is translated on gateway A; the reply arrives at gateway B.",
    choices: ["Asymmetric routing bypasses state", "DNS returned IPv6", "The switch flooded ARP"], correctIndex: 0, failedAssumption: "Both directions were assumed to cross the same stateful translator.", explanation: "Gateway B cannot reverse state created only on gateway A.", nextVerification: "Trace both directions and compare their NAT state tables.",
  },
];
