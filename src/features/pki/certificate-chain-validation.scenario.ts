import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const certificateChainValidationScenario: PacketFlowScenario = parsePacketFlowScenario({
  id: "pki-certificate-chain-validation",
  title: "PKI: validating a certificate chain up to a trusted root",
  description: "Watch a client validate a server's certificate by walking the chain from leaf to intermediate to a pre-trusted root, then checking validity, hostname, and revocation.",
  defaultSpeed: 1,
  devices: [
    { id: "client", label: "Client", role: "validates the chain", x: 140, y: 135 },
    { id: "server", label: "Server (example.com)", role: "presents leaf + intermediate", x: 640, y: 135 },
    { id: "intermediate-ca", label: "Intermediate CA", role: "signed the leaf certificate", x: 390, y: 280 },
    { id: "root-ca", label: "Root CA", role: "pre-trusted, self-signed", x: 390, y: 20 },
  ],
  links: [
    { id: "client-server", from: "client", to: "server" },
  ],
  steps: [
    {
      id: "server-presents-chain",
      title: "Server presents its certificate chain",
      explanation: "The server sends its leaf certificate for example.com, along with the intermediate CA certificate that signed it — but not the root, which the client is expected to already have.",
      durationMs: 2200,
      activeDeviceIds: ["server", "client"],
      activeLinkIds: ["client-server"],
      packet: { kind: "packet", label: "Certificate chain: leaf (example.com) + intermediate CA", from: "server", to: "client" },
      summaryFields: [
        { label: "Leaf certificate", value: "example.com" },
        { label: "Sent by server", value: "Leaf + intermediate (not root)" },
      ],
      detailFields: [],
    },
    {
      id: "client-checks-leaf-signature",
      title: "Client verifies the leaf's signature",
      explanation: "Using the public key from the intermediate certificate it just received, the client checks the leaf certificate's signature — confirming the leaf really was issued by that intermediate, and hasn't been tampered with.",
      durationMs: 2200,
      activeDeviceIds: ["client", "intermediate-ca"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Leaf signature", value: "Valid, signed by Intermediate CA", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "client-checks-intermediate-signature",
      title: "Client verifies the intermediate's signature",
      explanation: "The client now checks the intermediate CA certificate's own signature, using the root CA's public key. The root certificate itself wasn't sent by the server — the client must already hold it.",
      durationMs: 2200,
      activeDeviceIds: ["client", "root-ca"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Intermediate signature", value: "Valid, signed by Root CA", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "client-finds-root-in-trust-store",
      title: "Client confirms the root is already trusted",
      explanation: "The client looks up this root CA in its local trust store — pre-installed by the operating system or browser — and finds it listed as trusted. This is what lets the client trust a server it has never connected to before.",
      durationMs: 2200,
      activeDeviceIds: ["client", "root-ca"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Root CA in trust store?", value: "Yes — pre-installed", changed: true },
      ],
      detailFields: [
        { label: "Contrast", value: "SSH's trust-on-first-use has no equivalent pre-trusted anchor" },
      ],
    },
    {
      id: "client-checks-validity-and-hostname",
      title: "Client checks validity dates and hostname",
      explanation: "The client confirms the leaf certificate's validity window covers today's date, and that example.com appears in the certificate's Subject Alternative Name extension.",
      durationMs: 2200,
      activeDeviceIds: ["client"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Validity window", value: "Current date is within range" },
        { label: "Hostname in SAN?", value: "Yes — example.com listed" },
      ],
      detailFields: [],
    },
    {
      id: "client-checks-revocation-status",
      title: "Client checks the certificate hasn't been revoked",
      explanation: "The client checks the leaf certificate's revocation status — via a stapled OCSP response if the server provided one, or by querying the CA directly otherwise.",
      durationMs: 2200,
      activeDeviceIds: ["client"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Revocation status", value: "Not revoked" },
      ],
      detailFields: [
        { label: "If the check can't complete", value: "Many clients soft-fail and proceed anyway" },
      ],
    },
    {
      id: "chain-verified-connection-trusted",
      title: "Chain verified — the connection is trusted",
      explanation: "Every link checked out: leaf signed by the intermediate, intermediate signed by a pre-trusted root, valid dates, matching hostname, and no revocation. The client now trusts it's really talking to example.com.",
      durationMs: 2600,
      activeDeviceIds: ["client", "server"],
      activeLinkIds: ["client-server"],
      summaryFields: [
        { label: "Chain", value: "leaf → intermediate → trusted root", changed: true },
        { label: "Server identity", value: "Trusted" },
      ],
      detailFields: [],
    },
  ],
} as const);
