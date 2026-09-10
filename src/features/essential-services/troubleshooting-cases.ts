import { parseTroubleshootingCase, type ServiceId, type TroubleshootingCase } from "./essential-services.schema";

const build = (service: ServiceId, id: string, prompt: string, evidence: string, correct: string, wrong: string, diagnosis: string, nextStep: string) => parseTroubleshootingCase({
  id, service, prompt, evidence, choices: [correct, wrong], correctIndex: 0, diagnosis,
  explanation: `${evidence} supports this diagnosis.`, simplifiedExplanation: `Start with the service evidence: ${evidence}.`, nextStep,
});

export const troubleshootingCases: Record<ServiceId, readonly TroubleshootingCase[]> = {
  web: [
    build("web", "redirect-loop", "The browser reports too many redirects", "Repeated 301 and 302 responses point back to earlier URLs", "Check the redirect target", "Replace the network cable", "The redirect policy forms a loop.", "Correct the Location target and retest."),
    build("web", "gateway-timeout", "A proxy returns 504 Gateway Timeout", "The proxy connects but receives no timely upstream response", "Check upstream reachability and response time", "Change the browser font", "The upstream service is unavailable or too slow.", "Test the upstream from the proxy."),
  ],
  "remote-access": [
    build("remote-access", "host-key", "SSH warns that the host key changed", "The presented server identity differs from the saved key", "Verify the new host key out of band", "Ignore the warning permanently", "The endpoint identity changed or is being impersonated.", "Confirm the fingerprint with the administrator."),
    build("remote-access", "telnet-clear", "Credentials appear readable in a capture", "The session uses TCP port 23", "Replace Telnet with SSH", "Disable DNS caching", "Telnet does not encrypt the session.", "Enable SSH and retire Telnet access."),
  ],
  email: [
    build("email", "smtp-recipient", "SMTP relay rejected the recipient", "The server replied 550 5.1.1 during RCPT TO", "Verify the recipient address", "Restart the IMAP mailbox", "SMTP rejected the envelope recipient during delivery.", "Correct or confirm the recipient address."),
    build("email", "imap-auth", "Mail sends successfully but the inbox will not synchronize", "SMTP submission succeeds while IMAP authentication fails", "Check IMAP credentials and port", "Change the SMTP relay MX record", "Retrieval is failing independently of submission.", "Test the IMAP service on 993."),
  ],
  "file-transfer": [
    build("file-transfer", "active-blocked", "FTP login works but active transfers fail", "The server-initiated data connection is blocked", "Use passive mode or permit the data flow", "Change the SSH host key", "The FTP control channel works while the active data channel cannot open.", "Test passive mode and firewall policy."),
    build("file-transfer", "sftp-confusion", "An FTP client cannot connect to an SFTP-only service", "The service listens on SSH port 22, not FTP port 21", "Use an SFTP client", "Enable POP3", "SFTP is an SSH subsystem rather than FTP with encryption.", "Select SFTP and verify SSH access."),
  ],
  time: [
    build("time", "ntp-unreachable", "The NTP peer remains unreachable", "No UDP 123 response returns and reach stays zero", "Check UDP 123 routing and filtering", "Clear the HTTP cache", "NTP exchanges are not completing.", "Capture both directions of UDP 123."),
    build("time", "clock-offset", "The clock repeatedly steps by a large amount", "Calculated offset is large while network delay is stable", "Check the local clock source and upstream reference", "Change the SNMP community", "The time source or local oscillator is inconsistent.", "Compare multiple trusted NTP peers."),
  ],
  monitoring: [
    build("monitoring", "community", "SNMP polling times out on a legacy device", "UDP 161 reaches the agent but the community does not match", "Verify credentials and prefer SNMPv3", "Open FTP passive ports", "The agent rejects the request's security parameters.", "Configure matching secure SNMP credentials."),
    build("monitoring", "trap-missing", "Polling works but alerts never arrive", "GetResponse traffic uses 161 but no notifications reach UDP 162", "Check the trap destination and UDP 162", "Restart the IMAP mailbox", "The notification path is separate from polling.", "Verify agent destination and manager listener."),
  ],
};
