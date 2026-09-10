import type { DnsMessage, DnsRecord } from "./dns.schema";

const headerMeanings: Record<string, string> = {
  ID: "Matches a response to its query.", QR: "Distinguishes a query from a response.", OPCODE: "Names the requested operation.",
  AA: "Marks an authoritative answer.", TC: "Marks a truncated response.", RD: "Requests recursive service.",
  RA: "Reports recursion availability.", AD: "Reports authenticated data.", CD: "Disables resolver checking for this request.",
  RCODE: "Reports the DNS response status.", QDCOUNT: "Counts Question entries.", ANCOUNT: "Counts Answer records.",
  NSCOUNT: "Counts Authority records.", ARCOUNT: "Counts Additional records.",
};

function RecordSection({ name, records }: { name: string; records: readonly DnsRecord[] }) {
  return (
    <div className="packet-table-scroll dns-message-section" role="region" aria-label={`DNS ${name} section`} tabIndex={0}>
      <table>
        <caption>{name} records in this message</caption>
        <thead><tr><th>Owner</th><th>Type</th><th>Class</th><th>TTL</th><th>RDLENGTH</th><th>Decoded data</th><th>Purpose</th></tr></thead>
        <tbody>{records.length ? records.map((record, index) => (
          <tr key={`${record.owner}-${record.type}-${index}`}><td>{record.owner}</td><td>{record.type}</td><td>{record.class}</td><td>{record.ttl}</td><td>{record.rdLength}</td><td>{record.data}</td><td>{record.purpose}</td></tr>
        )) : <tr><td colSpan={7}>No records</td></tr>}</tbody>
      </table>
    </div>
  );
}

export function DnsMessageInspector({ message }: { message: DnsMessage }) {
  const { header } = message;
  const fields: readonly [string, string | number][] = [
    ["ID", header.id], ["QR", header.qr ? "Response" : "Query"], ["OPCODE", header.opcode], ["AA", Number(header.aa)],
    ["TC", Number(header.tc)], ["RD", Number(header.rd)], ["RA", Number(header.ra)], ["AD", Number(header.ad)],
    ["CD", Number(header.cd)], ["RCODE", header.rcode], ["QDCOUNT", header.qdCount], ["ANCOUNT", header.anCount],
    ["NSCOUNT", header.nsCount], ["ARCOUNT", header.arCount],
  ];
  return (
    <section className="dns-message-inspector" aria-label="DNS message inspector">
      <p><strong>{message.transport}</strong> {message.sourcePort} → {message.destinationPort}</p>
      <div className="packet-table-scroll" role="region" aria-label="DNS header fields" tabIndex={0}>
        <table aria-label="DNS header"><caption>DNS header fields</caption><thead><tr><th>Field</th><th>Value</th><th>Meaning</th></tr></thead>
          <tbody>{fields.map(([field, value]) => <tr key={field}><th scope="row">{field}</th><td>{value}</td><td>{headerMeanings[field]}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="packet-table-scroll dns-message-section" role="region" aria-label="DNS Question section" tabIndex={0}>
        <table><caption>Question entries in this message</caption><thead><tr><th>Name</th><th>Type</th><th>Class</th></tr></thead>
          <tbody>{message.question.length ? message.question.map((entry, index) => <tr key={`${entry.name}-${entry.type}-${index}`}><td>{entry.name}</td><td>{entry.type}</td><td>{entry.class}</td></tr>) : <tr><td colSpan={3}>No records</td></tr>}</tbody>
        </table>
      </div>
      <RecordSection name="Answer" records={message.answer} />
      <RecordSection name="Authority" records={message.authority} />
      <RecordSection name="Additional" records={message.additional} />
    </section>
  );
}
