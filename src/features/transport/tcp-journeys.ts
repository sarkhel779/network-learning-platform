import { parseTcpScenario, type TcpScenario, type TcpScenarioStep } from "./transport.schema";

export type TcpJourneyStep = TcpScenarioStep;

const client = { id: "client", label: "Client", ip: "192.0.2.10", port: 49152 };
const server = { id: "server", label: "Server", ip: "198.51.100.20", port: 443 };

function step(overrides: Partial<TcpScenarioStep> & Pick<TcpScenarioStep, "id" | "title" | "explanation">): TcpScenarioStep {
  return {
    direction: "none", flags: [], sequenceNumber: null, acknowledgementNumber: null,
    payloadBytes: 0, receiveWindow: null, clientState: "CLOSED", serverState: "LISTEN",
    outcome: overrides.title, terminal: false, ...overrides,
  };
}

function scenario(id: string, title: string, steps: TcpScenarioStep[], conclusion: string): TcpScenario {
  return parseTcpScenario({ id, title, description: conclusion, client, server, steps, conclusion });
}

export const tcpScenarios = [
  scenario("handshake", "Successful three-way handshake", [
    step({ id: "syn", title: "Client sends SYN", explanation: "The client proposes initial sequence number 1000.", direction: "client-to-server", flags: ["SYN"], sequenceNumber: 1000, receiveWindow: 64240, clientState: "SYN-SENT" }),
    step({ id: "syn-ack", title: "Server replies SYN-ACK", explanation: "The server acknowledges 1001 and proposes 5000.", direction: "server-to-client", flags: ["SYN", "ACK"], sequenceNumber: 5000, acknowledgementNumber: 1001, receiveWindow: 65535, clientState: "SYN-SENT", serverState: "SYN-RECEIVED" }),
    step({ id: "ack", title: "Client sends ACK", explanation: "The client acknowledges the server's SYN.", direction: "client-to-server", flags: ["ACK"], sequenceNumber: 1001, acknowledgementNumber: 5001, receiveWindow: 64240, clientState: "ESTABLISHED", serverState: "ESTABLISHED" }),
    step({ id: "established", title: "Connection established", explanation: "Both endpoints can now exchange application bytes.", clientState: "ESTABLISHED", serverState: "ESTABLISHED", outcome: "Both endpoints are established", terminal: true }),
  ], "The three messages synchronized both endpoints before application data began."),
  scenario("data-transfer", "Application data transfer", [
    step({ id: "send-data", title: "Send 100 bytes", explanation: "TCP numbers the first byte 1001.", direction: "client-to-server", flags: ["PSH", "ACK"], sequenceNumber: 1001, acknowledgementNumber: 5001, payloadBytes: 100, receiveWindow: 64240, clientState: "ESTABLISHED", serverState: "ESTABLISHED" }),
    step({ id: "ack-data", title: "Acknowledge next byte", explanation: "ACK 1101 confirms receipt through byte 1100.", direction: "server-to-client", flags: ["ACK"], sequenceNumber: 5001, acknowledgementNumber: 1101, receiveWindow: 65435, clientState: "ESTABLISHED", serverState: "ESTABLISHED" }),
    step({ id: "data-complete", title: "Data delivered in order", explanation: "Transport acknowledgement does not prove application-level success.", clientState: "ESTABLISHED", serverState: "ESTABLISHED", outcome: "100 bytes accepted in order", terminal: true }),
  ], "TCP acknowledged the byte range while application success remains a separate question."),
  scenario("lost-segment", "Lost segment and retransmission", [
    step({ id: "first-send", title: "Send sequence 1001", explanation: "The 100-byte segment is lost before acceptance.", direction: "client-to-server", flags: ["PSH", "ACK"], sequenceNumber: 1001, acknowledgementNumber: 5001, payloadBytes: 100, receiveWindow: 64240, clientState: "ESTABLISHED", serverState: "ESTABLISHED", outcome: "Segment not observed by server" }),
    step({ id: "wait", title: "Acknowledgement does not advance", explanation: "The sender has no evidence that this sequence range arrived.", clientState: "ESTABLISHED", serverState: "ESTABLISHED", outcome: "Retransmission timer expires" }),
    step({ id: "retransmit", title: "Retransmit sequence 1001", explanation: "TCP sends the same byte range again.", direction: "client-to-server", flags: ["PSH", "ACK"], sequenceNumber: 1001, acknowledgementNumber: 5001, payloadBytes: 100, receiveWindow: 64240, clientState: "ESTABLISHED", serverState: "ESTABLISHED", outcome: "Retransmitted copy arrives" }),
    step({ id: "retransmit-ack", title: "Acknowledge 1101", explanation: "The receiver accepts the byte range once and advances its acknowledgement.", direction: "server-to-client", flags: ["ACK"], sequenceNumber: 5001, acknowledgementNumber: 1101, receiveWindow: 65435, clientState: "ESTABLISHED", serverState: "ESTABLISHED", outcome: "100 bytes accepted once", terminal: true }),
  ], "Retransmission reused the missing sequence range; duplicates are not new application bytes."),
  scenario("graceful-close", "Graceful connection close", [
    step({ id: "client-fin", title: "Client sends FIN", explanation: "The client has finished sending.", direction: "client-to-server", flags: ["FIN", "ACK"], sequenceNumber: 1101, acknowledgementNumber: 5001, receiveWindow: 64240, clientState: "FIN-WAIT", serverState: "ESTABLISHED" }),
    step({ id: "server-ack", title: "Server acknowledges FIN", explanation: "One direction is closed.", direction: "server-to-client", flags: ["ACK"], sequenceNumber: 5001, acknowledgementNumber: 1102, receiveWindow: 65535, clientState: "FIN-WAIT", serverState: "CLOSE-WAIT" }),
    step({ id: "server-fin", title: "Server sends FIN", explanation: "The server finishes its direction.", direction: "server-to-client", flags: ["FIN", "ACK"], sequenceNumber: 5001, acknowledgementNumber: 1102, receiveWindow: 65535, clientState: "FIN-WAIT", serverState: "LAST-ACK" }),
    step({ id: "close-ack", title: "Client sends final ACK", explanation: "The close exchange completes.", direction: "client-to-server", flags: ["ACK"], sequenceNumber: 1102, acknowledgementNumber: 5002, receiveWindow: 64240, clientState: "TIME-WAIT", serverState: "CLOSED", terminal: true }),
  ], "FIN and ACK close each sending direction without treating the session as an abrupt reset."),
  scenario("connection-refused", "Connection refused with reset", [
    step({ id: "refused-syn", title: "Client sends SYN", explanation: "The client targets a reachable host and closed TCP port.", direction: "client-to-server", flags: ["SYN"], sequenceNumber: 1000, receiveWindow: 64240, clientState: "SYN-SENT", serverState: "CLOSED" }),
    step({ id: "refused-rst", title: "Host returns RST", explanation: "The response rejects this connection attempt.", direction: "server-to-client", flags: ["RST", "ACK"], sequenceNumber: 0, acknowledgementNumber: 1001, clientState: "CLOSED", serverState: "CLOSED", outcome: "Connection refused", terminal: true }),
  ], "A reset is explicit rejection evidence, unlike silence."),
  scenario("connection-timeout", "Connection attempt timeout", [
    step({ id: "timeout-syn", title: "Client sends SYN", explanation: "The connection request leaves the client.", direction: "client-to-server", flags: ["SYN"], sequenceNumber: 1000, receiveWindow: 64240, clientState: "SYN-SENT", serverState: "LISTEN" }),
    step({ id: "timeout-retry", title: "Client retries SYN", explanation: "No response has been observed, so the request is retried.", direction: "client-to-server", flags: ["SYN"], sequenceNumber: 1000, receiveWindow: 64240, clientState: "SYN-SENT", serverState: "LISTEN" }),
    step({ id: "timeout", title: "Attempt times out", explanation: "Silence alone does not identify loss, filtering, routing, or host state.", direction: "none", flags: [], clientState: "CLOSED", serverState: "LISTEN", outcome: "No response observed before deadline", terminal: true }),
  ], "A timeout records missing response evidence, not one proven cause."),
] as const;

export function buildTcpJourney(input: TcpScenario): readonly TcpJourneyStep[] {
  return parseTcpScenario(input).steps;
}
