import { canonicalPorts } from "./service-scenarios";
import type { ServiceId } from "./essential-services.schema";

const facts: Record<ServiceId, { label: string; transport: string; ports: readonly number[] }> = {
  web: { label: "HTTP and HTTPS", transport: "TCP", ports: canonicalPorts.web },
  "remote-access": { label: "SSH and Telnet", transport: "TCP", ports: canonicalPorts.remoteAccess },
  email: { label: "SMTP, IMAP, and POP3", transport: "TCP", ports: canonicalPorts.email },
  "file-transfer": { label: "FTP, FTPS, and SFTP", transport: "TCP", ports: canonicalPorts.fileTransfer },
  time: { label: "NTP", transport: "UDP", ports: canonicalPorts.time },
  monitoring: { label: "SNMP", transport: "UDP", ports: canonicalPorts.monitoring },
};

export function PortTransportPanel({ service }: { service: ServiceId }) {
  const fact = facts[service];
  return <aside className="port-transport-panel" aria-label={`${fact.label} ports and transport`}><strong>{fact.transport}</strong><span>Common ports: {fact.ports.join(", ")}</span></aside>;
}
