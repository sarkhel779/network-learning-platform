import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/networking-foundations", name), "utf8");

describe("TCP, UDP and Ports content", () => {
  it("keeps twelve packet-first sections and both players public", () => {
    const lesson = read("tcp-udp-and-ports.public.mdx");
    expect([...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1])).toEqual([
      "why-transport-protocols-exist", "segments-datagrams-ports-sockets", "source-destination-ports-multiplexing",
      "tcp-udp-header-essentials", "interactive-tcp-connection", "sequence-acknowledgements-ordered-delivery",
      "loss-retransmission-duplicates", "flow-control-receive-window", "graceful-closure-resets",
      "interactive-tcp-udp-port-delivery", "common-service-ephemeral-ports", "choosing-tcp-or-udp",
    ]);
    expect(lesson.match(/<TcpConnectionPlayer\b/g)).toHaveLength(1);
    expect(lesson.match(/<PortDeliveryPlayer\b/g)).toHaveLength(1);
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(10);
    for (const phrase of ["HTTP", "HTTPS", "DNS", "DHCP", "SSH", "SMTP", "NTP", "ephemeral", "application-level success", "may return", "silence"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
  });

  it("protects inspection, diagnosis, troubleshooting, checks, and Pro depth", () => {
    const lesson = read("tcp-udp-and-ports.account.mdx");
    for (const id of ["inspect-transport-evidence", "guided-transport-diagnosis", "troubleshoot-transport", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["TRANSPORT_ACCOUNT_SENTINEL", "tcp.flags.syn == 1", "tcp.analysis.retransmission", "ss", "netstat", "Get-NetTCPConnection", "listener", "return path", "congestion control", "window scaling", "SACK", "QUIC"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
  });
});
