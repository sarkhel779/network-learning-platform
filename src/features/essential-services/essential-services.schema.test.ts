import { describe, expect, it } from "vitest";

import {
  parseCaptureExercise,
  parseRfcExercise,
  parseServiceScenario,
  parseTroubleshootingCase,
} from "./essential-services.schema";
import { canonicalPorts, serviceScenarios } from "./service-scenarios";

const validStep = {
  id: "request",
  title: "Request",
  sender: "client",
  receiver: "server",
  transport: "TCP" as const,
  sourcePort: 49152,
  destinationPort: 80,
  message: {
    name: "Request",
    fields: [{ name: "Method", value: "GET", explanation: "Requests a representation." }],
  },
  explanation: "Send request",
  evidence: "tcp.dstport == 80",
  terminal: true,
};

describe("essential-services schema", () => {
  it("accepts all six service identifiers and a valid ordered journey", () => {
    for (const service of ["web", "remote-access", "email", "file-transfer", "time", "monitoring"] as const) {
      expect(parseServiceScenario({
        id: `${service}-journey`, service, title: service,
        steps: [validStep],
        conclusion: "Complete",
      }).service).toBe(service);
    }
  });

  it("rejects duplicate steps, invalid ports, and a journey without one terminal step", () => {
    expect(() => parseServiceScenario({ id: "bad", service: "web", title: "Bad", steps: [], conclusion: "No" })).toThrow();
    expect(() => parseServiceScenario({ id: "bad", service: "web", title: "Bad", steps: [validStep, { ...validStep }], conclusion: "No" })).toThrow(/unique/i);
    expect(() => parseServiceScenario({ id: "bad", service: "web", title: "Bad", steps: [{ ...validStep, destinationPort: 65_536 }], conclusion: "No" })).toThrow();
    expect(() => parseServiceScenario({ id: "bad", service: "web", title: "Bad", steps: [{ ...validStep, terminal: false }], conclusion: "No" })).toThrow(/terminal/i);
  });

  it("validates troubleshooting and capture answer indexes for their declared service", () => {
    expect(parseTroubleshootingCase({
      id: "smtp-relay", service: "email", prompt: "SMTP relay rejected the recipient",
      evidence: "550 5.1.1 recipient rejected", choices: ["Check the recipient", "Restart IMAP"], correctIndex: 0,
      diagnosis: "The recipient was rejected during relay.", explanation: "SMTP accepted the connection but rejected the address.",
      simplifiedExplanation: "The sending server could not deliver to that address.", nextStep: "Verify the recipient address.",
    }).service).toBe("email");
    expect(() => parseTroubleshootingCase({
      id: "bad", service: "email", prompt: "Bad", evidence: "Evidence", choices: ["Only choice"], correctIndex: 1,
      diagnosis: "Diagnosis", explanation: "Explanation", simplifiedExplanation: "Simple", nextStep: "Next",
    })).toThrow(/correct answer/i);
    expect(parseCaptureExercise({
      id: "ntp-exchange", service: "time", title: "NTP capture", displayFilter: "ntp",
      conversation: "A client exchanges NTP timestamps with a server.",
      rows: [{ number: 1, relativeTime: "0.000000", source: "192.0.2.10", destination: "198.51.100.123", protocol: "NTP", length: 90, summary: "Client request" }],
      question: "What traffic is shown?", options: ["NTP", "SNMP"], correctIndex: 0,
      evidence: "UDP port 123", explanation: "NTP uses UDP port 123.",
    }).service).toBe("time");
    expect(() => parseCaptureExercise({
      id: "bad", service: "time", title: "Bad", displayFilter: "ntp", conversation: "Conversation",
      rows: [{ number: 0, relativeTime: "0", source: "a", destination: "b", protocol: "NTP", length: 0, summary: "request" }],
      question: "Question", options: ["Yes", "No"], correctIndex: 2, evidence: "Evidence", explanation: "Explanation",
    })).toThrow();
  });

  it("requires RFC Editor URLs and an in-range correct answer", () => {
    expect(() => parseRfcExercise({ id: "bad", service: "web", question: "Valid?", options: ["Yes", "No"], correctIndex: 2, rule: "Rule", evidence: "Evidence", consequence: "Consequence", referenceLabel: "RFC 9110", referenceUrl: "https://example.com" })).toThrow();
    expect(parseRfcExercise({
      id: "http-semantics", service: "web", question: "Valid?", options: ["Yes", "No"], correctIndex: 0,
      rule: "A request has a method.", evidence: "The method is GET.", consequence: "The server can apply request semantics.",
      referenceLabel: "RFC 9110", referenceUrl: "https://www.rfc-editor.org/rfc/rfc9110.html",
    }).service).toBe("web");
  });

  it("provides a complete, validated account journey for each service and every canonical port", () => {
    expect(Object.keys(serviceScenarios).sort()).toEqual(["email", "file-transfer", "monitoring", "remote-access", "time", "web"]);
    expect(canonicalPorts).toEqual({
      web: [80, 443, 8080], remoteAccess: [22, 23],
      email: [25, 465, 587, 143, 993, 110, 995],
      fileTransfer: [20, 21, 22, 990], time: [123], monitoring: [161, 162],
    });

    expect(serviceScenarios.web.steps.map(({ destinationPort }) => destinationPort)).toEqual(expect.arrayContaining([80, 443, 8080]));
    expect(serviceScenarios["remote-access"].steps.map(({ destinationPort }) => destinationPort)).toEqual(expect.arrayContaining([22, 23]));
    expect(serviceScenarios.email.steps.map(({ destinationPort }) => destinationPort)).toEqual(expect.arrayContaining([25, 465, 587, 143, 993, 110, 995]));
    expect(serviceScenarios["file-transfer"].steps.map(({ id }) => id)).toEqual(expect.arrayContaining(["ftp-control", "ftp-active-data", "ftp-passive-data", "ftps-control", "sftp-session"]));
    expect(serviceScenarios.time.steps.find(({ id }) => id === "ntp-four-timestamps")?.message.fields.map(({ name }) => name)).toEqual([
      "T1 origin timestamp", "T2 receive timestamp", "T3 transmit timestamp", "T4 destination timestamp",
    ]);
    expect(serviceScenarios.monitoring.steps.map(({ id }) => id)).toEqual(expect.arrayContaining(["snmp-poll", "snmp-trap", "snmp-inform"]));
  });
});
