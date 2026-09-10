import type { DhcpPacket } from "./dhcp.schema";

const fields = [
  ["op", "8 bits", "Distinguishes a request from a reply."],
  ["htype", "8 bits", "Identifies the hardware address type."],
  ["hlen", "8 bits", "Gives the hardware address length."],
  ["hops", "8 bits", "Counts relay-agent forwarding hops."],
  ["xid", "32 bits", "Correlates packets in one transaction."],
  ["secs", "16 bits", "Reports elapsed acquisition time."],
  ["flags", "16 bits", "Carries the DHCP broadcast-request bit."],
  ["ciaddr", "32 bits", "Carries a client address already valid for use."],
  ["yiaddr", "32 bits", "Carries the address offered or assigned to the client."],
  ["siaddr", "32 bits", "Carries the next-server/bootstrap address when used."],
  ["giaddr", "32 bits", "Carries the first relay address for subnet selection."],
  ["chaddr", "16 bytes", "Carries the client hardware-address field."],
  ["sname", "64 bytes", "Optionally carries a server host name."],
  ["file", "128 bytes", "Optionally carries a boot-file name."],
  ["magic cookie", "4 bytes", "Marks the following data as DHCP options."],
] as const;

function fieldValue(packet: DhcpPacket, name: typeof fields[number][0]) {
  if (name === "magic cookie") return packet.bootp.magicCookie;
  return String(packet.bootp[name]);
}

function significance(packet: DhcpPacket, name: typeof fields[number][0]) {
  if (name === "flags") return packet.bootp.flags & 0x8000 ? "The broadcast bit is set." : "The broadcast bit is clear.";
  if (name === "giaddr") return packet.bootp.giaddr === "0.0.0.0" ? "No relay address is used on this leg." : "The server uses this relay address to select the client subnet.";
  if (name === "yiaddr") return packet.bootp.yiaddr === "0.0.0.0" ? "No client address is supplied in this field yet." : "This is the proposed or confirmed client address.";
  return `This packet carries ${fieldValue(packet, name) || "an empty value"}.`;
}

function Region({ name, children }: { name: string; children: React.ReactNode }) {
  return <section aria-label={name} className="dhcp-inspector-region"><h4>{name}</h4>{children}</section>;
}

export function DhcpPacketInspector({ packet }: { packet: DhcpPacket }) {
  return <div className="dhcp-packet-inspector">
    <Region name="Ethernet"><dl><dt>Source</dt><dd>{packet.ethernet.source}</dd><dt>Destination</dt><dd>{packet.ethernet.destination}</dd></dl></Region>
    <Region name="IPv4"><dl><dt>Source</dt><dd>{packet.ipv4.source}</dd><dt>Destination</dt><dd>{packet.ipv4.destination}</dd></dl></Region>
    <Region name="UDP"><dl><dt>Source port</dt><dd>{packet.udp.sourcePort}</dd><dt>Destination port</dt><dd>{packet.udp.destinationPort}</dd></dl></Region>
    <Region name="Delivery evidence"><div className="table-scroll"><table><tbody>
      <tr><th>DHCP broadcast flag</th><td>{packet.bootp.flags & 0x8000 ? "set" : "clear"}</td></tr>
      <tr><th>IPv4 destination</th><td>{packet.ipv4.destination}</td></tr>
      <tr><th>Ethernet destination</th><td>{packet.ethernet.destination}</td></tr>
    </tbody></table></div></Region>
    <Region name="BOOTP/DHCP"><div className="table-scroll"><table><thead><tr><th>Field</th><th>Size</th><th>Value and meaning</th></tr></thead><tbody>
      {fields.map(([name, size, purpose]) => <tr key={name}><th>{name}</th><td>{size}</td><td><code>{fieldValue(packet, name) || "empty"}</code><br />Purpose: {purpose}<br />Here: {significance(packet, name)}</td></tr>)}
    </tbody></table></div></Region>
    <Region name="DHCP options"><div className="table-scroll"><table><thead><tr><th>Code</th><th>Option</th><th>Length</th><th>Value</th><th>Meaning</th></tr></thead><tbody>
      {packet.options.map((item) => <tr key={`${item.code}-${item.name}`}><td>{item.code}</td><th>{item.name}</th><td>{item.length}</td><td>{item.value}</td><td>{item.meaning}</td></tr>)}
    </tbody></table></div></Region>
  </div>;
}
