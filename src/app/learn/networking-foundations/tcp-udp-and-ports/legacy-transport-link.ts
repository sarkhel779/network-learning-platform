const tcpBase = "/learn/networking-foundations/tcp-reliable-transport";
const udpBase = "/learn/networking-foundations/udp-datagrams-and-ports";

const udpAnchors: Readonly<Record<string, string>> = {
  "interactive-tcp-udp-port-delivery": "interactive-udp-port-delivery",
  "common-service-ephemeral-ports": "udp-service-examples",
  "choosing-tcp-or-udp": "choosing-udp",
};

const tcpAnchors = new Set([
  "why-transport-protocols-exist", "segments-datagrams-ports-sockets", "source-destination-ports-multiplexing",
  "tcp-udp-header-essentials", "interactive-tcp-connection", "sequence-acknowledgements-ordered-delivery",
  "loss-retransmission-duplicates", "flow-control-receive-window", "graceful-closure-resets",
  "inspect-transport-evidence", "guided-transport-diagnosis", "troubleshoot-transport",
  "knowledge-check-summary", "pro-deep-dive",
]);

export function resolveLegacyTransportUrl(hash: string, search: string): string {
  let anchor = "";
  try { anchor = decodeURIComponent(hash.replace(/^#/, "")); } catch { return `${tcpBase}${search}`; }
  if (Object.hasOwn(udpAnchors, anchor)) return `${udpBase}${search}#${udpAnchors[anchor]}`;
  if (tcpAnchors.has(anchor)) return `${tcpBase}${search}#${anchor}`;
  return `${tcpBase}${search}`;
}
