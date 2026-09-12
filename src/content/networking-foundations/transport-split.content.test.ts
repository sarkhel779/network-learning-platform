import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(resolve("src/content/networking-foundations", name), "utf8");

describe("separate TCP and UDP lessons", () => {
  it("teaches TCP options and packet-level loss recovery in its own lesson", () => {
    const publicLesson = read("tcp-reliable-transport.public.mdx");
    expect(publicLesson).toContain('<TcpConnectionPlayer progressItemId="tcp_udp_and_ports_interactive_interactive_tcp_connection" />');
    expect(publicLesson).toContain('<TcpWindowPlayer progressItemId="tcp_udp_and_ports_interactive_interactive_tcp_window" />');
    for (const phrase of ["MSS", "Window Scale", "SACK-Permitted", "left edge", "right edge", "fast retransmit", "three duplicate ACKs"])
      expect(publicLesson).toContain(phrase);
    expect(publicLesson).toContain("Client SYN");
    expect(publicLesson).toContain("Server SYN-ACK");
    expect(publicLesson).not.toContain("<PortDeliveryPlayer");
  });

  it("keeps UDP's header, datagram flow and checks separate", () => {
    const publicLesson = read("udp-datagrams-and-ports.public.mdx");
    const accountLesson = read("udp-datagrams-and-ports.account.mdx");
    expect(publicLesson).toContain('<ProtocolFormatDiagram kind="udp" />');
    expect(publicLesson).toContain('<UdpPortDeliveryPlayer progressItemId="udp_datagrams_and_ports_interactive_interactive_udp_port_delivery" />');
    expect(publicLesson).toContain("DNS");
    expect(publicLesson).toContain("DHCP");
    expect(accountLesson.match(/<KnowledgeCheck progressItemId="udp_datagrams_and_ports_check_/g)).toHaveLength(3);
  });
});
