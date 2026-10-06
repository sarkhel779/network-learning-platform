import { HostIcon, RouterIcon, ServerIcon } from "../hop-icons";
import type { HopScenarioData } from "../hop-lab-types";

export const staticNatBasicsScenario: HopScenarioData = {
  topologyAriaLabel: "Request path from an external client through a NAT router to an internal server",
  devices: [
    { id: "client", label: "External client", sublabel: "Internet", icon: <HostIcon /> },
    { id: "router", label: "NAT router", sublabel: "Static entry", icon: <RouterIcon /> },
    { id: "server", label: "Internal server", sublabel: "192.168.1.10", icon: <ServerIcon /> },
  ],
  steps: [
    {
      fromId: "client", toId: "router",
      title: "Client requests the public address",
      explanation: "The external client sends a request to the server's public IP. It has no idea the server's real private address even exists.",
      fields: [{ label: "Destination IP", value: "203.0.113.5" }, { label: "Destination Port", value: "80" }],
    },
    {
      fromId: "router", toId: "server",
      title: "Router translates to the private address",
      explanation: "The static NAT entry maps 203.0.113.5 to 192.168.1.10. The router rewrites the destination and forwards the packet inside.",
      fields: [{ label: "Destination IP (translated)", value: "192.168.1.10" }, { label: "Destination Port", value: "80" }],
    },
    {
      fromId: "server", toId: "router",
      title: "Server replies from its private address",
      explanation: "The server's reply is addressed from its real private IP — it has no idea any translation happened.",
      fields: [{ label: "Source IP", value: "192.168.1.10" }],
    },
    {
      fromId: "router", toId: "client",
      title: "Router translates the source back to public",
      explanation: "Before forwarding the reply to the internet, the router rewrites the source back to the public address so the client's session stays consistent.",
      fields: [{ label: "Source IP (translated)", value: "203.0.113.5" }],
      outcome: "delivered",
    },
  ],
  quiz: {
    question: "This router only has the one static NAT entry above. What happens if a different internal host, 192.168.1.20, tries to initiate an outbound connection?",
    options: [
      { id: "correct", label: "It has no translation of its own and can't reach the internet" },
      { id: "shares", label: "It automatically shares 203.0.113.5's translation" },
      { id: "autoentry", label: "The router creates a new static entry for it automatically" },
      { id: "subnetwide", label: "Static NAT also covers every host on the subnet" },
    ],
    correctId: "correct",
    feedbackCorrect: "Correct. A static NAT entry only covers the one host it's configured for — .20 needs its own static entry, or a separate dynamic/PAT rule, to reach the internet.",
    feedbackIncorrect: "Not quite. A static NAT entry is a one-to-one mapping for a single host — it doesn't extend to any other address on the subnet.",
  },
};
