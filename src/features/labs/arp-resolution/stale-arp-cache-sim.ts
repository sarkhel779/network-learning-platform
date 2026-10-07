import type { ArpResolutionConfig } from "./arp-resolution-types";

export const staleArpCacheSim: ArpResolutionConfig = {
  title: "ARP cache troubleshooting",
  canvasAriaLabel: "Host A trying to reach a print server whose ARP cache entry is stale",
  hostLabel: "Host A",
  hostIp: "192.168.1.15",
  hostMac: "AA:AA:AA:AA:AA:AA",
  destinationLabel: "Print server",
  destinationIp: "192.168.1.25",
  destinationMac: "EE:EE:EE:EE:EE:EE",
  subnetMask: "255.255.255.0",
  intro: "Host A has printed to 192.168.1.25 for months, but the last three jobs have silently failed. Its ARP cache still has an entry from before the print server's network card was replaced last week.",
  andQuestion: "Before troubleshooting further, it's worth confirming this is even a local problem. Which operation compares an IP address against a subnet mask to find its network address?",
  andOptions: [
    { value: "NOT", label: "NOT" },
    { value: "OR", label: "OR" },
    { value: "XOR", label: "XOR" },
    { value: "AND", label: "AND" },
  ],
  andCorrectValue: "AND",
  nextHopConclusion: "Both addresses land on the same network, 192.168.1.0/24 — this was never a routing problem. The fault is in how Host A is reaching 192.168.1.25 directly.",
  decisionStep: {
    prompt: "Host A's ARP cache already has an entry: 192.168.1.25 → DD:DD:DD:DD:DD:DD. That was the print server's MAC before its NIC was replaced. What should Host A do to print successfully?",
    options: [
      { value: "resend", label: "Resend the print job — the cached entry should still be fine" },
      { value: "reARP", label: "Clear the stale entry and send a fresh ARP request" },
    ],
    correctValue: "reARP",
    dropExplanation: "Still nothing comes back. Host A keeps addressing frames to DD:DD:DD:DD:DD:DD — a MAC that doesn't exist on this network anymore. The switch has no idea where to forward them, and the print server never sees the job.",
    dropAtNodeId: "switch",
    proceedExplanation: "Right. An ARP cache entry is only a snapshot of what was true when it was learned. Once the hardware changes, the stale mapping has to be flushed and re-resolved before anything can get through.",
  },
  requestIntro: "Host A has cleared the stale entry, leaving an ARP cache miss for 192.168.1.25. Here's a draft of the fresh request it's about to send — fix anything that's wrong, then send it.",
  requestFields: [
    {
      key: "etherDest",
      label: "Ethernet destination (frame)",
      correctValue: "ff:ff:ff:ff:ff:ff",
      options: [
        { value: "ff:ff:ff:ff:ff:ff", label: "FF:FF:FF:FF:FF:FF (broadcast)" },
        { value: "dd:dd:dd:dd:dd:dd", label: "DD:DD:DD:DD:DD:DD (the old cached MAC)" },
        { value: "aa:aa:aa:aa:aa:aa", label: "AA:AA:AA:AA:AA:AA (Host A itself)" },
        { value: "00:00:00:00:00:00", label: "00:00:00:00:00:00 (unknown)" },
      ],
    },
    {
      key: "senderMac",
      label: "Sender MAC (ARP payload)",
      correctValue: "aa:aa:aa:aa:aa:aa",
      options: [
        { value: "ff:ff:ff:ff:ff:ff", label: "FF:FF:FF:FF:FF:FF (broadcast)" },
        { value: "dd:dd:dd:dd:dd:dd", label: "DD:DD:DD:DD:DD:DD (the old cached MAC)" },
        { value: "aa:aa:aa:aa:aa:aa", label: "AA:AA:AA:AA:AA:AA (Host A's own MAC)" },
        { value: "00:00:00:00:00:00", label: "00:00:00:00:00:00 (unknown)" },
      ],
    },
    {
      key: "senderIp",
      label: "Sender IP (ARP payload)",
      correctValue: "192.168.1.15",
      options: [
        { value: "192.168.1.15", label: "192.168.1.15 (Host A's own IP)" },
        { value: "192.168.1.25", label: "192.168.1.25 (the print server's IP)" },
        { value: "255.255.255.255", label: "255.255.255.255" },
        { value: "0.0.0.0", label: "0.0.0.0" },
      ],
    },
    {
      key: "targetMac",
      label: "Target MAC (ARP payload)",
      correctValue: "00:00:00:00:00:00",
      options: [
        { value: "00:00:00:00:00:00", label: "00:00:00:00:00:00 (unknown — this is what we're resolving)" },
        { value: "dd:dd:dd:dd:dd:dd", label: "DD:DD:DD:DD:DD:DD (the old cached MAC)" },
        { value: "ff:ff:ff:ff:ff:ff", label: "FF:FF:FF:FF:FF:FF (broadcast)" },
        { value: "aa:aa:aa:aa:aa:aa", label: "AA:AA:AA:AA:AA:AA (Host A's own MAC)" },
      ],
    },
    {
      key: "targetIp",
      label: "Target IP (ARP payload)",
      correctValue: "192.168.1.25",
      options: [
        { value: "192.168.1.25", label: "192.168.1.25 (the print server — the address we want to resolve)" },
        { value: "192.168.1.15", label: "192.168.1.15 (Host A's own IP)" },
        { value: "192.168.1.1", label: "192.168.1.1 (a guessed gateway)" },
        { value: "0.0.0.0", label: "0.0.0.0" },
      ],
    },
    {
      key: "opcode",
      label: "Opcode",
      correctValue: "1",
      options: [
        { value: "1", label: "1 (Request)" },
        { value: "2", label: "2 (Reply)" },
      ],
    },
  ],
  draftOverrides: {
    etherDest: "dd:dd:dd:dd:dd:dd",
    targetMac: "dd:dd:dd:dd:dd:dd",
  },
  replyFields: [
    { label: "Ethernet destination (frame)", value: "AA:AA:AA:AA:AA:AA (Host A)" },
    { label: "Sender MAC (ARP payload)", value: "EE:EE:EE:EE:EE:EE (the print server's new NIC)" },
    { label: "Sender IP (ARP payload)", value: "192.168.1.25" },
    { label: "Target MAC (ARP payload)", value: "AA:AA:AA:AA:AA:AA (Host A)" },
    { label: "Target IP (ARP payload)", value: "192.168.1.15" },
    { label: "Opcode", value: "2 (Reply)" },
  ],
  cacheLearnedMessage: "Host A's ARP cache now correctly maps 192.168.1.25 to EE:EE:EE:EE:EE:EE, replacing the stale DD:DD:DD:DD:DD:DD entry. The next print job gets through.",
};
