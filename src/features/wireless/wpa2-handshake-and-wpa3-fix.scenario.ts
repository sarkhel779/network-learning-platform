import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const wpa2HandshakeAndWpa3FixScenario: PacketFlowScenario = parsePacketFlowScenario({
  id: "wpa2-handshake-and-wpa3-fix",
  title: "WPA2's 4-way handshake, its offline-attack weakness, and how WPA3 fixes it",
  description: "Watch a client and AP derive session keys from a shared password over four messages, then watch a passive eavesdropper use a captured copy of that handshake to test passwords entirely offline — and see why WPA3's SAE closes that gap.",
  defaultSpeed: 1,
  devices: [
    { id: "client", label: "Client", role: "already knows the Wi-Fi password", x: 140, y: 110 },
    { id: "ap", label: "Access Point", role: "already knows the Wi-Fi password", x: 560, y: 110 },
    { id: "attacker", label: "Attacker", role: "passive eavesdropper", x: 350, y: 320 },
  ],
  links: [
    { id: "client-ap", from: "client", to: "ap" },
  ],
  steps: [
    {
      id: "both-sides-already-derived-the-pmk",
      title: "Both sides already hold the same PMK — nothing to send yet",
      explanation: "Before any handshake message is sent, both the client and the AP independently compute a Pairwise Master Key (PMK) from the Wi-Fi password and the network's SSID, using PBKDF2 with 4,096 iterations. Since both sides already know the password and SSID, this step requires no network exchange at all — and the PMK itself is never transmitted.",
      durationMs: 2400,
      activeDeviceIds: ["client", "ap"],
      activeLinkIds: [],
      summaryFields: [
        { label: "PMK derived from", value: "PBKDF2(password, SSID) — never sent" },
      ],
      detailFields: [],
    },
    {
      id: "ap-sends-anonce",
      title: "Message 1: the AP sends a random ANonce",
      explanation: "The AP generates a random nonce (ANonce) and sends it to the client in the clear. A nonce ensures the keys derived from this handshake will be different every time, even with the same password.",
      durationMs: 2000,
      activeDeviceIds: ["ap", "client"],
      activeLinkIds: ["client-ap"],
      packet: { kind: "frame", label: "ANonce", from: "ap", to: "client" },
      summaryFields: [
        { label: "Message", value: "1 of 4 — ANonce" },
      ],
      detailFields: [],
    },
    {
      id: "client-derives-ptk-and-replies",
      title: "Message 2: the client derives the PTK and replies with SNonce + MIC",
      explanation: "The client generates its own random SNonce, then combines the PMK, ANonce, SNonce, and both MAC addresses to derive the Pairwise Transient Key (PTK) — the actual session key. It sends its SNonce back along with a Message Integrity Code (MIC) computed using part of the new PTK, proving it holds the correct PMK without revealing it.",
      durationMs: 2600,
      activeDeviceIds: ["client", "ap"],
      activeLinkIds: ["client-ap"],
      packet: { kind: "frame", label: "SNonce + MIC", from: "client", to: "ap" },
      summaryFields: [
        { label: "Message", value: "2 of 4 — SNonce + MIC" },
        { label: "Client now has", value: "PTK (derived, never sent)", changed: true },
      ],
      detailFields: [
        { label: "PTK derived from", value: "PMK + ANonce + SNonce + both MAC addresses" },
      ],
    },
    {
      id: "ap-confirms-and-sends-gtk",
      title: "Message 3: the AP verifies the MIC and sends the GTK",
      explanation: "The AP now has everything needed to compute the same PTK independently. It checks the client's MIC matches, confirming the client knows the correct password, then sends the Group Temporal Key (GTK) — used for broadcast and multicast traffic — encrypted and authenticated with the new PTK.",
      durationMs: 2600,
      activeDeviceIds: ["ap", "client"],
      activeLinkIds: ["client-ap"],
      packet: { kind: "frame", label: "GTK (encrypted) + MIC", from: "ap", to: "client" },
      summaryFields: [
        { label: "Message", value: "3 of 4 — GTK + MIC" },
        { label: "AP's PTK", value: "Matches the client's independently derived PTK" },
      ],
      detailFields: [],
    },
    {
      id: "client-installs-keys-handshake-complete",
      title: "Message 4: the client confirms, keys are installed",
      explanation: "The client installs the PTK and GTK and sends a final acknowledgment. From this point on, the PTK encrypts all unicast traffic between the client and AP, and the GTK encrypts broadcast and multicast traffic.",
      durationMs: 2400,
      activeDeviceIds: ["client", "ap"],
      activeLinkIds: ["client-ap"],
      packet: { kind: "frame", label: "ACK — handshake complete", from: "client", to: "ap" },
      summaryFields: [
        { label: "Message", value: "4 of 4 — installation confirmed" },
        { label: "Session state", value: "Encrypted and authenticated", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "attacker-passively-captured-all-four-messages",
      title: "An attacker passively captured all four messages",
      explanation: "None of the four handshake messages were encrypted — ANonce, SNonce, and both MICs all crossed the air in the clear, because at this point neither side has a shared key yet to encrypt them with. Anyone within radio range, including this attacker, could capture a complete copy of the exchange just by listening, without ever interacting with the client or AP.",
      durationMs: 2600,
      activeDeviceIds: ["attacker"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Attacker captured", value: "ANonce, SNonce, both MAC addresses, both MICs" },
      ],
      detailFields: [
        { label: "Attacker did not need", value: "Any interaction with the client or AP" },
      ],
    },
    {
      id: "attacker-runs-an-offline-dictionary-attack",
      title: "The attacker tests passwords entirely offline",
      explanation: "With a captured handshake in hand, the attacker can try candidate passwords on their own hardware with no further contact with the network at all: for each guess, derive a candidate PMK, derive the candidate PTK from the captured nonces and MAC addresses, compute a candidate MIC, and compare it to the real one. A match reveals the password. Because this requires no interaction with the AP, there's nothing to rate-limit or lock out.",
      durationMs: 2800,
      activeDeviceIds: ["attacker"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Attack surface", value: "Fully offline — no AP interaction needed", changed: true },
      ],
      detailFields: [
        { label: "Why it works", value: "The MIC can be recomputed from public values plus any candidate password" },
      ],
      stateNote: "A long, random password makes this attack infeasible — but a short or common one can be recovered this way given enough time, which is WPA2-Personal's core structural weakness.",
    },
    {
      id: "wpa3-sae-closes-this-gap",
      title: "WPA3's SAE closes this gap with forward secrecy",
      explanation: "WPA3-Personal replaces this PSK-derived first step with SAE (Simultaneous Authentication of Equals), a Diffie-Hellman-based exchange also known as Dragonfly. SAE derives a unique session key through a live, interactive exchange with the AP — an eavesdropper who passively captures it cannot test password guesses offline the way they can against WPA2, because each guess would require a real, rate-limitable exchange with the AP itself.",
      durationMs: 2800,
      activeDeviceIds: ["client", "ap", "attacker"],
      activeLinkIds: [],
      summaryFields: [
        { label: "WPA3 fix", value: "SAE — interactive, not offline-crackable", changed: true },
      ],
      detailFields: [
        { label: "Also known as", value: "Dragonfly handshake" },
      ],
      stateNote: "SAE also provides forward secrecy: even if the password is later discovered, previously captured traffic from past sessions still can't be decrypted.",
    },
  ],
} as const);
