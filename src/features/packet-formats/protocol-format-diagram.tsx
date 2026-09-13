type Format = { name: string; rows: readonly (readonly string[])[]; note: string };

const formats = {
  ethernet: {
    name: "Ethernet II frame format",
    rows: [["Destination MAC · 6 bytes", "Source MAC · 6 bytes"], ["EtherType · 2 bytes"], ["Payload and any required padding · variable"], ["Frame check sequence (FCS) · 4 bytes"]],
    note: "The preamble and start-frame delimiter precede the frame on the wire. Many captures omit them and the FCS. An 802.1Q tag, when present, sits before EtherType.",
  },
  vlan: {
    name: "802.1Q tagged Ethernet frame format",
    rows: [["Destination MAC · 6 bytes", "Source MAC · 6 bytes"], ["Tag protocol identifier (TPID) · 2 bytes", "Tag control information (TCI) · 2 bytes"], ["Original EtherType · 2 bytes"], ["Payload and any required padding · variable"], ["FCS · 4 bytes"]],
    note: "The TCI carries 3 priority bits, 1 drop-eligible bit, and a 12-bit VLAN ID. The tag is inserted between source MAC and EtherType.",
  },
  arp: {
    name: "Ethernet IPv4 ARP packet format",
    rows: [["Hardware type · 2 bytes", "Protocol type · 2 bytes"], ["Hardware length · 1 byte", "Protocol length · 1 byte", "Operation · 2 bytes"], ["Sender hardware (MAC) address · 6 bytes"], ["Sender protocol (IPv4) address · 4 bytes"], ["Target hardware (MAC) address · 6 bytes"], ["Target protocol (IPv4) address · 4 bytes"]],
    note: "This is the common Ethernet/IPv4 form. A request may not yet know the target MAC; ARP sits inside an Ethernet frame, not inside an IPv4 packet.",
  },
  ipv4: {
    name: "IPv4 packet header format",
    rows: [["Version · 4 bits", "IHL · 4 bits", "DSCP + ECN · 8 bits", "Total length · 16 bits"], ["Identification · 16 bits", "Flags + fragment offset · 16 bits"], ["TTL · 8 bits", "Protocol · 8 bits", "Header checksum · 16 bits"], ["Source IPv4 address · 32 bits"], ["Destination IPv4 address · 32 bits"], ["Options + padding · optional"], ["Payload · variable"]],
    note: "The base header is 20 bytes; IHL gives the header size when options are present. TTL changes at each router. Cell widths here are schematic, not bit-proportional.",
  },
  ipv6: {
    name: "IPv6 packet header format",
    rows: [["Version · 4 bits", "Traffic class · 8 bits", "Flow label · 20 bits"], ["Payload length · 16 bits", "Next header · 8 bits", "Hop limit · 8 bits"], ["Source IPv6 address · 128 bits"], ["Destination IPv6 address · 128 bits"], ["Extension headers · optional"], ["Upper-layer payload · variable"]],
    note: "The fixed IPv6 base header is 40 bytes. Next Header identifies the following extension header or upper-layer protocol; routers decrement Hop Limit.",
  },
  icmp: {
    name: "ICMPv4 Echo message format",
    rows: [["Type · 8 bits", "Code · 8 bits", "Checksum · 16 bits"], ["Identifier · 16 bits", "Sequence number · 16 bits"], ["Echo data · variable"]],
    note: "Echo Request is type 8/code 0; Echo Reply is type 0/code 0. ICMP error messages have a different body that quotes the triggering packet.",
  },
  tcp: {
    name: "TCP segment header format",
    rows: [["Source port · 16 bits", "Destination port · 16 bits"], ["Sequence number · 32 bits"], ["Acknowledgement number · 32 bits"], ["Data offset · 4 bits", "Reserved · 3 bits", "Flags · 9 bits", "Receive window · 16 bits"], ["Checksum · 16 bits", "Urgent pointer · 16 bits"], ["Options + padding · optional"], ["Application data · variable"]],
    note: "The minimum TCP header is 20 bytes. Data Offset locates the payload; flags include SYN, ACK, FIN and RST. Cell widths are schematic, not bit-proportional.",
  },
  udp: {
    name: "UDP datagram header format",
    rows: [["Source port · 16 bits", "Destination port · 16 bits"], ["Length · 16 bits", "Checksum · 16 bits"], ["Application data · variable"]],
    note: "The UDP header is 8 bytes. Length includes header plus data; a zero checksum is permitted only for IPv4 UDP, with narrowly defined IPv6 exceptions.",
  },
  dns: {
    name: "DNS message format",
    rows: [["Transaction ID · 16 bits", "Flags · 16 bits"], ["Question count · 16 bits", "Answer count · 16 bits"], ["Authority count · 16 bits", "Additional count · 16 bits"], ["Question section · variable"], ["Answer section · variable"], ["Authority section · variable"], ["Additional section · variable"]],
    note: "The DNS header is 12 bytes. Flags include response and recursion bits. A TCP-carried DNS message has a two-byte length prefix outside the DNS message.",
  },
  httpRequest: {
    name: "HTTP request message format",
    rows: [["Request line · GET /guide HTTP/1.1"], ["Header fields · Host: packetsecrets.com"], ["Blank line · ends the header section"], ["Optional request body"]],
    note: "This shows HTTP/1.1 text messages, not a fixed-size binary packet header. HTTP/2 and HTTP/3 use different wire framing.",
  },
  httpResponse: {
    name: "HTTP response message format",
    rows: [["Status line · HTTP/1.1 200 OK"], ["Header fields · Content-Type: text/html"], ["Blank line · ends the header section"], ["Optional response body"]],
    note: "A status code is an application response. HTTP/2 and HTTP/3 keep the request/response concepts but use different wire framing.",
  },
} as const satisfies Record<string, Format>;

export type ProtocolFormatKind = keyof typeof formats;

export function ProtocolFormatDiagram({ kind }: { kind: ProtocolFormatKind }) {
  const format = formats[kind];
  return <figure className="protocol-format">
    <p className="protocol-format__hint">Swipe sideways to see all fields</p>
    <div className="protocol-format__scroll" role="region" aria-label={`${format.name} diagram`} tabIndex={0}>
      <table><caption className="sr-only">{format.name}</caption><tbody>
        {format.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((field) => <td key={field} colSpan={12 / row.length}>{field}</td>)}</tr>)}
      </tbody></table>
    </div>
    <figcaption>{format.note} <span>Cell widths are schematic, not byte/bit proportional.</span></figcaption>
  </figure>;
}
