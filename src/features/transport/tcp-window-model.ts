export type TcpWindowScenario = "normal" | "fast-retransmit" | "timeout";
export type SackBlock = Readonly<{ left: number; right: number }>;
export type TcpWindowStep = Readonly<{
  id: string;
  title: string;
  explanation: string;
  sendLeft: number;
  nextToSend: number;
  sendRight: number;
  cumulativeAck: number;
  duplicateAcks: number;
  sackBlocks: readonly SackBlock[];
  packet: string;
  direction: "forward" | "reverse" | "none";
  terminal: boolean;
}>;

function step(input: Omit<TcpWindowStep, "duplicateAcks" | "sackBlocks" | "terminal"> & Partial<Pick<TcpWindowStep, "duplicateAcks" | "sackBlocks" | "terminal">>): TcpWindowStep {
  if (input.sendLeft > input.nextToSend || input.nextToSend > input.sendRight) throw new Error("Invalid TCP send window");
  for (const block of input.sackBlocks ?? []) if (block.left >= block.right) throw new Error("Invalid SACK block");
  return { duplicateAcks: 0, sackBlocks: [], terminal: false, ...input };
}

const opening = [
  step({ id: "start", title: "Sender is ready", explanation: "The sender may transmit bytes 1001 through 1500. Left edge 1001 is the oldest unacknowledged byte; right edge 1501 is the first byte outside this example's window.", sendLeft: 1001, nextToSend: 1001, sendRight: 1501, cumulativeAck: 1001, packet: "Ready", direction: "none" }),
  step({ id: "first-send", title: "Send bytes 1001–1100", explanation: "One 100-byte segment leaves the sender. The next-to-send pointer becomes 1101, but the left edge remains at 1001 until an ACK arrives.", sendLeft: 1001, nextToSend: 1101, sendRight: 1501, cumulativeAck: 1001, packet: "DATA 1001–1100", direction: "forward" }),
  step({ id: "first-ack", title: "ACK 1101 slides the window", explanation: "ACK 1101 means the receiver next expects byte 1101. The left edge moves to 1101, and a 500-byte receive window now reaches right edge 1601.", sendLeft: 1101, nextToSend: 1101, sendRight: 1601, cumulativeAck: 1101, packet: "ACK 1101", direction: "reverse" }),
] as const;

const normal = [
  ...opening,
  step({ id: "second-send", title: "Send the next segment", explanation: "Bytes 1101–1200 fit inside the current send window. MSS limits this example's segment payload to 100 bytes.", sendLeft: 1101, nextToSend: 1201, sendRight: 1601, cumulativeAck: 1101, packet: "DATA 1101–1200", direction: "forward" }),
  step({ id: "second-ack", title: "ACK 1201 advances", explanation: "The receiver has contiguous bytes through 1200. ACK 1201 moves the left edge forward; no SACK block is needed.", sendLeft: 1201, nextToSend: 1201, sendRight: 1701, cumulativeAck: 1201, packet: "ACK 1201", direction: "reverse", terminal: true }),
] as const;

const fast = [
  ...opening,
  step({ id: "missing-send", title: "Bytes 1101–1200 are lost", explanation: "The sender transmits this range but it does not arrive. The receiver still expects byte 1101.", sendLeft: 1101, nextToSend: 1201, sendRight: 1601, cumulativeAck: 1101, packet: "DATA 1101–1200 lost", direction: "forward" }),
  step({ id: "out-of-order", title: "Later bytes arrive out of order", explanation: "Bytes 1201–1400 arrive while 1101–1200 are missing. Duplicate ACKs still say 1101; SACK block [1201, 1401) reports the later bytes already held.", sendLeft: 1101, nextToSend: 1401, sendRight: 1601, cumulativeAck: 1101, duplicateAcks: 2, sackBlocks: [{ left: 1201, right: 1401 }], packet: "ACK 1101 + SACK [1201,1401)", direction: "reverse" }),
  step({ id: "third-duplicate-ack", title: "Third duplicate ACK", explanation: "Bytes 1401–1500 also arrive. The third duplicate ACK keeps the cumulative ACK at 1101 and extends the SACK block to [1201, 1501).", sendLeft: 1101, nextToSend: 1501, sendRight: 1601, cumulativeAck: 1101, duplicateAcks: 3, sackBlocks: [{ left: 1201, right: 1501 }], packet: "3rd duplicate ACK 1101", direction: "reverse" }),
  step({ id: "fast-retransmit", title: "Fast retransmit the gap", explanation: "Three duplicate ACKs indicate likely loss, so TCP retransmits bytes 1101–1200 without waiting for the retransmission timer. SACK says the later block need not be resent.", sendLeft: 1101, nextToSend: 1501, sendRight: 1601, cumulativeAck: 1101, duplicateAcks: 3, sackBlocks: [{ left: 1201, right: 1501 }], packet: "RETRANSMIT 1101–1200", direction: "forward" }),
  step({ id: "repaired-ack", title: "The gap closes", explanation: "Once 1101–1200 arrives, the receiver has a continuous byte stream through 1500. Cumulative ACK 1501 moves the sender's left edge to 1501.", sendLeft: 1501, nextToSend: 1501, sendRight: 2001, cumulativeAck: 1501, packet: "ACK 1501", direction: "reverse", terminal: true }),
] as const;

const timeout = [
  ...opening,
  step({ id: "timeout-loss", title: "A segment gets no ACK", explanation: "Bytes 1101–1200 are lost, and too little later data arrives to generate three duplicate ACKs.", sendLeft: 1101, nextToSend: 1201, sendRight: 1601, cumulativeAck: 1101, packet: "DATA 1101–1200 lost", direction: "forward" }),
  step({ id: "timeout-retransmit", title: "Retransmission timer expires", explanation: "With no fast-retransmit signal, the retransmission timeout triggers a resend of bytes 1101–1200.", sendLeft: 1101, nextToSend: 1201, sendRight: 1601, cumulativeAck: 1101, packet: "TIMEOUT: RETRANSMIT", direction: "forward" }),
  step({ id: "timeout-ack", title: "ACK 1201 arrives", explanation: "The retransmitted bytes arrive and cumulative ACK 1201 moves the sender's left edge.", sendLeft: 1201, nextToSend: 1201, sendRight: 1701, cumulativeAck: 1201, packet: "ACK 1201", direction: "reverse", terminal: true }),
] as const;

export function buildTcpWindowJourney(scenario: TcpWindowScenario): readonly TcpWindowStep[] {
  if (scenario === "fast-retransmit") return fast;
  if (scenario === "timeout") return timeout;
  return normal;
}
