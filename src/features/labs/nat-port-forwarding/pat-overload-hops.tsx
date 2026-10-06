import { CloudIcon, HostIcon, RouterIcon } from "../hop-icons";
import type { HopScenarioData } from "../hop-lab-types";

export const patOverloadScenario: HopScenarioData = {
  topologyAriaLabel: "Request path from a host through a PAT router to an internet server",
  devices: [
    { id: "hostA", label: "Host A", sublabel: "192.168.1.10:5000", icon: <HostIcon /> },
    { id: "router", label: "NAT router", sublabel: "PAT / overload", icon: <RouterIcon /> },
    { id: "internet", label: "Internet server", sublabel: "93.184.216.34:443", icon: <CloudIcon /> },
  ],
  steps: [
    {
      fromId: "hostA", toId: "router",
      title: "Host A opens a connection",
      explanation: "Host A sends traffic from its private address and port toward the internet server.",
      fields: [{ label: "Source", value: "192.168.1.10:5000" }, { label: "Destination", value: "93.184.216.34:443" }],
    },
    {
      fromId: "router", toId: "internet",
      title: "Router translates to a shared public port",
      explanation: "PAT rewrites the source to the router's single public IP, using a unique port number so replies come back to the right host.",
      fields: [{ label: "Translated source", value: "203.0.113.9:40001" }],
    },
    {
      fromId: "internet", toId: "router",
      title: "Server replies to the public address",
      explanation: "The reply is addressed to the public IP and port the router used — the server never sees Host A's real private address.",
      fields: [{ label: "Destination", value: "203.0.113.9:40001" }],
    },
    {
      fromId: "router", toId: "hostA",
      title: "Router reverses the translation",
      explanation: "The router looks up port 40001 in its PAT table, finds Host A, and rewrites the destination back to Host A's private address.",
      fields: [{ label: "Destination (translated)", value: "192.168.1.10:5000" }],
      outcome: "delivered",
    },
  ],
  quiz: {
    question: "With PAT, two hosts can share one public IP at the same time. What actually keeps their sessions from colliding?",
    options: [
      { id: "correct", label: "Each gets a different translated port number on the shared public IP" },
      { id: "turns", label: "They take turns — one connection at a time" },
      { id: "hiddenip", label: "Each is secretly assigned a second public IP" },
      { id: "duplicate", label: "The router duplicates every reply to both hosts" },
    ],
    correctId: "correct",
    feedbackCorrect: "Correct. The port number is what distinguishes sessions sharing one public IP — the router's translation table maps each (public IP, public port) pair back to a specific internal host and port.",
    feedbackIncorrect: "Not quite. PAT works because each session gets a unique translated port on the shared public IP — that's the lookup key the router uses for return traffic.",
  },
};
