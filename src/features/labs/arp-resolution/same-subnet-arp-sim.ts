import type { ArpResolutionConfig } from "./arp-resolution-types";

export const sameSubnetArpSim: ArpResolutionConfig = {
  title: "ARP within the same subnet",
  canvasAriaLabel: "Host A sending an ARP request on the local LAN to reach a server",
  hostLabel: "Host A",
  hostIp: "192.168.1.10",
  hostMac: "AA:AA:AA:AA:AA:AA",
  destinationLabel: "Server",
  destinationIp: "192.168.1.20",
  destinationMac: "BB:BB:BB:BB:BB:BB",
  subnetMask: "255.255.255.0",
  intro: "Host A wants to send data to 192.168.1.20, but its ARP cache has no entry for that IP yet — it doesn't know the destination's MAC address.",
  andQuestion: "Before Host A can decide who to ask for that MAC address, it has to work out whether 192.168.1.20 is on its own LAN or somewhere else. Which operation compares an IP address against a subnet mask to find its network address?",
  andOptions: [
    { value: "OR", label: "OR" },
    { value: "AND", label: "AND" },
    { value: "XOR", label: "XOR" },
    { value: "NOT", label: "NOT" },
  ],
  andCorrectValue: "AND",
  nextHopConclusion: "Both addresses land on the same network, 192.168.1.0/24. Host A doesn't need a router — it can ARP directly for 192.168.1.20.",
  requestFields: [
    {
      key: "etherDest",
      label: "Ethernet destination (frame)",
      correctValue: "ff:ff:ff:ff:ff:ff",
      options: [
        { value: "ff:ff:ff:ff:ff:ff", label: "FF:FF:FF:FF:FF:FF (broadcast)" },
        { value: "bb:bb:bb:bb:bb:bb", label: "BB:BB:BB:BB:BB:BB (the server)" },
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
        { value: "bb:bb:bb:bb:bb:bb", label: "BB:BB:BB:BB:BB:BB (the server's MAC)" },
        { value: "aa:aa:aa:aa:aa:aa", label: "AA:AA:AA:AA:AA:AA (Host A's own MAC)" },
        { value: "00:00:00:00:00:00", label: "00:00:00:00:00:00 (unknown)" },
      ],
    },
    {
      key: "senderIp",
      label: "Sender IP (ARP payload)",
      correctValue: "192.168.1.10",
      options: [
        { value: "192.168.1.10", label: "192.168.1.10 (Host A's own IP)" },
        { value: "192.168.1.20", label: "192.168.1.20 (the server's IP)" },
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
        { value: "ff:ff:ff:ff:ff:ff", label: "FF:FF:FF:FF:FF:FF (broadcast)" },
        { value: "bb:bb:bb:bb:bb:bb", label: "BB:BB:BB:BB:BB:BB (the server's MAC)" },
        { value: "aa:aa:aa:aa:aa:aa", label: "AA:AA:AA:AA:AA:AA (Host A's own MAC)" },
      ],
    },
    {
      key: "targetIp",
      label: "Target IP (ARP payload)",
      correctValue: "192.168.1.20",
      options: [
        { value: "192.168.1.20", label: "192.168.1.20 (the address we want to resolve)" },
        { value: "192.168.1.10", label: "192.168.1.10 (Host A's own IP)" },
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
  replyFields: [
    { label: "Ethernet destination (frame)", value: "AA:AA:AA:AA:AA:AA (Host A)" },
    { label: "Sender MAC (ARP payload)", value: "BB:BB:BB:BB:BB:BB (the server)" },
    { label: "Sender IP (ARP payload)", value: "192.168.1.20" },
    { label: "Target MAC (ARP payload)", value: "AA:AA:AA:AA:AA:AA (Host A)" },
    { label: "Target IP (ARP payload)", value: "192.168.1.10" },
    { label: "Opcode", value: "2 (Reply)" },
  ],
  cacheLearnedMessage: "Host A's ARP cache now maps 192.168.1.20 to BB:BB:BB:BB:BB:BB. It can finally address the original packet to the right MAC.",
};
