import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const sshKeyAuthenticationScenario: PacketFlowScenario = parsePacketFlowScenario({
  id: "ssh-public-key-authentication",
  title: "SSH: connecting and authenticating with a public key",
  description: "Watch a client check a server's host key, establish an encrypted session, and authenticate with a public key by signing a challenge — never sending the private key itself.",
  defaultSpeed: 1,
  devices: [
    { id: "client", label: "Client", role: "wants to log in", x: 140, y: 135 },
    { id: "server", label: "Server", role: "verifies identity", x: 640, y: 135 },
  ],
  links: [
    { id: "client-server", from: "client", to: "server" },
  ],
  steps: [
    {
      id: "client-connects-tcp",
      title: "Client opens a TCP connection to port 22",
      explanation: "The client opens a TCP connection to the server's SSH port, and both sides exchange a version banner identifying their SSH implementation before anything else happens.",
      durationMs: 1800,
      activeDeviceIds: ["client", "server"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "TCP connect + SSH version banner", from: "client", to: "server" },
      summaryFields: [
        { label: "Port", value: "22" },
      ],
      detailFields: [],
    },
    {
      id: "server-sends-host-key",
      title: "Server presents its host key",
      explanation: "As part of key exchange setup, the server presents its host key. The client checks this against its known_hosts file — on a first-ever connection to this server, there's nothing to compare against yet (trust-on-first-use).",
      durationMs: 2200,
      activeDeviceIds: ["server", "client"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "Host key fingerprint", from: "server", to: "client" },
      summaryFields: [
        { label: "known_hosts match?", value: "First connection — none on file yet" },
      ],
      detailFields: [
        { label: "If this were a later connection", value: "A mismatch here would trigger a loud warning" },
      ],
    },
    {
      id: "key-exchange-session-established",
      title: "Key exchange establishes an encrypted session",
      explanation: "A Diffie-Hellman key exchange derives session keys for encryption and integrity. From this point forward — including the authentication step that's about to happen — everything on this connection is encrypted.",
      durationMs: 2200,
      activeDeviceIds: ["client", "server"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Session", value: "Encrypted from here on", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "client-offers-public-key",
      title: "Client offers to authenticate with a public key",
      explanation: "The client tells the server which user it wants to log in as and offers a public key it holds. The server checks whether that exact public key is listed in that user's authorized_keys file.",
      durationMs: 2200,
      activeDeviceIds: ["client", "server"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "Offered public key (encrypted)", from: "client", to: "server" },
      summaryFields: [
        { label: "authorized_keys match?", value: "Yes — key is listed" },
      ],
      detailFields: [
        { label: "Private key sent?", value: "No — and it never will be" },
      ],
    },
    {
      id: "server-challenges-client",
      title: "Server challenges the client to prove possession",
      explanation: "Having a public key on file only means the server recognizes it — not that whoever is connecting actually holds the matching private key. The server sends a random challenge value the client must sign.",
      durationMs: 2200,
      activeDeviceIds: ["server", "client"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "Challenge (random value, encrypted)", from: "server", to: "client" },
      summaryFields: [
        { label: "Proves nothing yet", value: "Recognizing a public key ≠ proof of possession" },
      ],
      detailFields: [],
    },
    {
      id: "client-signs-challenge",
      title: "Client signs the challenge with its private key",
      explanation: "The client signs the server's challenge using its private key — which never leaves the client's machine — and sends back only the signature.",
      durationMs: 2200,
      activeDeviceIds: ["client", "server"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "Signed challenge (encrypted)", from: "client", to: "server" },
      summaryFields: [
        { label: "Private key location", value: "Still only on the client" },
      ],
      detailFields: [],
      stateNote: "A different random challenge every connection means a captured signature can't be replayed to authenticate again.",
    },
    {
      id: "server-grants-access-and-opens-channels",
      title: "Server verifies the signature and opens channels",
      explanation: "The server verifies the signature using the public key it already had on file. Authentication succeeds, and the connection can now multiplex multiple channels — a shell, SFTP, port forwarding — all over this one encrypted connection.",
      durationMs: 2600,
      activeDeviceIds: ["server", "client"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Authentication", value: "Succeeded", changed: true },
        { label: "Channels available", value: "Shell, SFTP, port forwarding — multiplexed" },
      ],
      detailFields: [],
    },
  ],
} as const);
