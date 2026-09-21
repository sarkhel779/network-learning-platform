import {
  parsePacketFlowScenario,
  type PacketFlowScenario,
  type PacketFlowStep,
} from "@/features/packet-flow/packet-flow.schema";

export type HostConversationId = "web-request" | "print-job" | "file-sharing";

export type HostConversationStep = Readonly<{
  clientId: string;
  serverId: string;
  bubble: Readonly<{
    deviceId: string;
    eyebrow: "CLIENT" | "SERVER" | "HOST";
    title: string;
    description: string;
  }>;
}>;

export type HostConversation = Readonly<{
  id: HostConversationId;
  label: string;
  summary: string;
  scenario: PacketFlowScenario;
  stepRoles: readonly HostConversationStep[];
}>;

const TEACHING_STEP_DURATION_MS = 5200;

function packetStep({
  id,
  title,
  explanation,
  from,
  to,
  linkId,
  label,
}: Readonly<{
  id: string;
  title: string;
  explanation: string;
  from: string;
  to: string;
  linkId: string;
  label: string;
}>): PacketFlowStep {
  return {
    id,
    title,
    explanation,
    durationMs: TEACHING_STEP_DURATION_MS,
    activeDeviceIds: [from],
    activeLinkIds: [linkId],
    packet: { kind: "frame", label, from, to },
    summaryFields: [{ label: "Conversation", value: label, layer: "context" }],
    detailFields: [],
  };
}

function roleStep(
  clientId: string,
  serverId: string,
  deviceId: string,
  eyebrow: HostConversationStep["bubble"]["eyebrow"],
  title: string,
  description: string,
): HostConversationStep {
  return { clientId, serverId, bubble: { deviceId, eyebrow, title, description } };
}

const webScenario = parsePacketFlowScenario({
  id: "host-role-web-request",
  title: "Open a website",
  description: "A browser requests a page and a web server responds.",
  defaultSpeed: 1,
  devices: [
    { id: "laptop", label: "Laptop", role: "host", x: 135, y: 150 },
    { id: "web-server", label: "Web server", role: "host", x: 665, y: 150 },
  ],
  links: [{ id: "laptop-web-server", from: "laptop", to: "web-server" }],
  steps: [
    packetStep({
      id: "browser-requests-page",
      title: "The browser asks for a page",
      explanation: "The browser is the client application because it starts the request.",
      from: "laptop",
      to: "web-server",
      linkId: "laptop-web-server",
      label: "Page request",
    }),
    packetStep({
      id: "server-returns-page",
      title: "The web server responds",
      explanation: "The web service is the server application because it provides the requested page.",
      from: "web-server",
      to: "laptop",
      linkId: "laptop-web-server",
      label: "Page response",
    }),
  ],
});

const printScenario = parsePacketFlowScenario({
  id: "host-role-print-job",
  title: "Send a print job",
  description: "A laptop requests printing and a network printer returns its status.",
  defaultSpeed: 1,
  devices: [
    { id: "laptop", label: "Laptop", role: "host", x: 135, y: 150 },
    { id: "printer", label: "Network printer", role: "host", x: 665, y: 150 },
  ],
  links: [{ id: "laptop-printer", from: "laptop", to: "printer" }],
  steps: [
    packetStep({
      id: "laptop-sends-print-job",
      title: "The laptop requests printing",
      explanation: "The print application is the client because it asks the printer for a service.",
      from: "laptop",
      to: "printer",
      linkId: "laptop-printer",
      label: "Print request",
    }),
    packetStep({
      id: "printer-returns-status",
      title: "The printer returns status",
      explanation: "The printer provides the service and responds to the client application.",
      from: "printer",
      to: "laptop",
      linkId: "laptop-printer",
      label: "Printer response",
    }),
  ],
});

const fileSharingScenario = parsePacketFlowScenario({
  id: "host-role-file-sharing",
  title: "Share files both ways",
  description: "Two computers exchange files and reverse client and server roles.",
  defaultSpeed: 1,
  devices: [
    { id: "computer-a", label: "Computer A", role: "host", x: 135, y: 150 },
    { id: "computer-b", label: "Computer B", role: "host", x: 665, y: 150 },
  ],
  links: [{ id: "computer-a-computer-b", from: "computer-a", to: "computer-b" }],
  steps: [
    packetStep({
      id: "computer-a-requests-file",
      title: "Computer A requests a file",
      explanation: "Computer A is the client for this conversation because it asks for the shared file.",
      from: "computer-a",
      to: "computer-b",
      linkId: "computer-a-computer-b",
      label: "File request A to B",
    }),
    packetStep({
      id: "computer-b-serves-file",
      title: "Computer B serves the file",
      explanation: "Computer B is the server for this conversation because it provides the requested file.",
      from: "computer-b",
      to: "computer-a",
      linkId: "computer-a-computer-b",
      label: "File response B to A",
    }),
    packetStep({
      id: "computer-b-requests-file",
      title: "Computer B now requests a file",
      explanation: "The roles reverse: Computer B becomes the client when it starts a new request.",
      from: "computer-b",
      to: "computer-a",
      linkId: "computer-a-computer-b",
      label: "File request B to A",
    }),
    packetStep({
      id: "computer-a-serves-file",
      title: "Computer A now serves the file",
      explanation: "Computer A becomes the server because it provides the file requested by Computer B.",
      from: "computer-a",
      to: "computer-b",
      linkId: "computer-a-computer-b",
      label: "File response A to B",
    }),
  ],
});

export const hostRoleConversations: Readonly<Record<HostConversationId, HostConversation>> = {
  "web-request": {
    id: "web-request",
    label: "Open a website",
    summary: "A browser requests a page from a web server.",
    scenario: webScenario,
    stepRoles: [
      roleStep("laptop", "web-server", "laptop", "CLIENT", "Laptop requests a page", "The browser starts the conversation, so it is the client application."),
      roleStep("laptop", "web-server", "web-server", "SERVER", "Web server provides the page", "The web service answers the request, so it is the server application."),
    ],
  },
  "print-job": {
    id: "print-job",
    label: "Send a print job",
    summary: "A laptop asks a network printer to print.",
    scenario: printScenario,
    stepRoles: [
      roleStep("laptop", "printer", "laptop", "CLIENT", "Laptop requests printing", "The print application asks for a service, so it is the client."),
      roleStep("laptop", "printer", "printer", "SERVER", "Printer returns its status", "The printer provides the service and responds like a server."),
    ],
  },
  "file-sharing": {
    id: "file-sharing",
    label: "Share files both ways",
    summary: "Two computers reverse client and server roles.",
    scenario: fileSharingScenario,
    stepRoles: [
      roleStep("computer-a", "computer-b", "computer-a", "CLIENT", "Computer A asks for a file", "Computer A is the client in the first conversation."),
      roleStep("computer-a", "computer-b", "computer-b", "SERVER", "Computer B provides the file", "Computer B is the server in the first conversation."),
      roleStep("computer-b", "computer-a", "computer-b", "CLIENT", "Computer B asks for another file", "The roles reverse when Computer B starts a new request."),
      roleStep("computer-b", "computer-a", "computer-a", "SERVER", "Computer A provides the file", "Computer A is now the server for this conversation."),
    ],
  },
};
