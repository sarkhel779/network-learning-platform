import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const tlsHandshakeScenario: PacketFlowScenario = parsePacketFlowScenario({
  id: "tls-1-3-handshake",
  title: "TLS 1.3: a complete handshake in one round trip",
  description: "Watch a client and server negotiate TLS 1.3 in a single round trip: a guessed key share, the server's bundled key share and certificate, and the exchange that unlocks encrypted application data.",
  defaultSpeed: 1,
  devices: [
    { id: "client", label: "Client", role: "initiates the connection", x: 140, y: 135 },
    { id: "server", label: "Server (example.com)", role: "authenticates with a certificate", x: 640, y: 135 },
  ],
  links: [
    { id: "client-server", from: "client", to: "server" },
  ],
  steps: [
    {
      id: "client-hello",
      title: "Client sends ClientHello with a guessed key share",
      explanation: "The client sends a ClientHello listing supported cipher suites and TLS 1.3, the hostname it wants (SNI: example.com), and — guessing the server will accept a common key-exchange group — its own ECDHE key share for that group, all in this first message.",
      durationMs: 2200,
      activeDeviceIds: ["client", "server"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "ClientHello: SNI=example.com, key_share, cipher suites", from: "client", to: "server" },
      summaryFields: [
        { label: "SNI", value: "example.com" },
        { label: "Key share group", value: "x25519 (guessed)" },
      ],
      detailFields: [
        { label: "Supported versions", value: "TLS 1.3" },
        { label: "Cipher suites offered", value: "TLS_AES_128_GCM_SHA256, TLS_CHACHA20_POLY1305_SHA256" },
      ],
    },
    {
      id: "server-selects-parameters-and-sends-key-share",
      title: "Server accepts the guess and replies with its own key share",
      explanation: "The server accepts the client's guessed group, selects a cipher suite, and sends a ServerHello with its own key share. Both sides can now independently derive the same handshake traffic keys via (EC)DHE — after just this one exchange.",
      durationMs: 2200,
      activeDeviceIds: ["server", "client"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "ServerHello: key_share, cipher suite selected", from: "server", to: "client" },
      summaryFields: [
        { label: "Cipher suite", value: "TLS_AES_128_GCM_SHA256" },
        { label: "Handshake traffic keys", value: "Derivable by both sides now", changed: true },
      ],
      detailFields: [
        { label: "Key exchange", value: "(EC)DHE only — no static RSA option in TLS 1.3" },
      ],
    },
    {
      id: "server-sends-encrypted-certificate",
      title: "Server sends its certificate, now encrypted",
      explanation: "Everything from this point on is encrypted under the handshake traffic keys just derived. The server sends its X.509 certificate for example.com, chaining up to a certificate authority the client is expected to already trust.",
      durationMs: 2200,
      activeDeviceIds: ["server", "client"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "Certificate (encrypted): example.com", from: "server", to: "client" },
      summaryFields: [
        { label: "Certificate subject", value: "example.com" },
        { label: "Encrypted", value: "Yes — unlike TLS 1.2", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "server-sends-certificate-verify",
      title: "Server proves it holds the certificate's private key",
      explanation: "A certificate alone only proves the server has a copy of it. CertificateVerify is the server signing the entire handshake transcript so far with the certificate's private key — proof that it actually controls that key, not just that it possesses the public certificate.",
      durationMs: 2200,
      activeDeviceIds: ["server", "client"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "CertificateVerify: signed transcript", from: "server", to: "client" },
      summaryFields: [
        { label: "Proves", value: "Server holds the certificate's private key" },
      ],
      detailFields: [],
    },
    {
      id: "server-finished",
      title: "Server sends Finished, completing its single flight",
      explanation: "The server sends a Finished message — an HMAC over the handshake transcript using a derived finished key — confirming its half of the handshake. This is still the server's first and only flight of messages.",
      durationMs: 2200,
      activeDeviceIds: ["server", "client"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "Finished (server)", from: "server", to: "client" },
      summaryFields: [
        { label: "Server's handshake flight", value: "Complete in one trip", changed: true },
      ],
      detailFields: [],
      stateNote: "Everything since the ClientHello has taken exactly one round trip — TLS 1.2 needed two.",
    },
    {
      id: "client-verifies-and-sends-finished",
      title: "Client verifies and sends its own Finished",
      explanation: "The client validates the certificate chain, checks CertificateVerify's signature, and confirms the server's Finished MAC. Satisfied, it computes and sends its own Finished message back.",
      durationMs: 2200,
      activeDeviceIds: ["client", "server"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "Finished (client)", from: "client", to: "server" },
      summaryFields: [
        { label: "Client validated", value: "Certificate chain, CertificateVerify, server Finished" },
      ],
      detailFields: [],
    },
    {
      id: "application-data-protected",
      title: "Application data flows, encrypted and authenticated",
      explanation: "Both sides now derive application traffic keys from the shared secret. The client can send its HTTP request, encrypted and integrity-protected by an AEAD cipher — all unlocked after a single round trip.",
      durationMs: 2600,
      activeDeviceIds: ["client", "server"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "Application Data (AEAD-encrypted)", from: "client", to: "server" },
      summaryFields: [
        { label: "Protection", value: "AEAD (e.g. AES-128-GCM)" },
        { label: "Round trips used", value: "1", changed: true },
      ],
      detailFields: [],
      stateNote: "Compare to TLS 1.2, which needs two full round trips before any application data can be sent.",
    },
  ],
} as const);
