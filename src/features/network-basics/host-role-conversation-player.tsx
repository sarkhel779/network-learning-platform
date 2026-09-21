"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import { PacketFlowPlayer } from "@/features/packet-flow/packet-flow-player";
import { safeParsePacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";
import {
  hostRoleConversations,
  type HostConversation,
  type HostConversationId,
  type HostConversationStep,
} from "./host-role-conversations";

const conversationIds = ["web-request", "print-job", "file-sharing"] as const;

type HostRoleConversationPlayerProps = Readonly<{
  conversations?: unknown;
}>;

function validRoleStep(value: unknown): value is HostConversationStep {
  if (!value || typeof value !== "object") return false;
  const step = value as Partial<HostConversationStep>;
  return typeof step.clientId === "string"
    && typeof step.serverId === "string"
    && Boolean(step.bubble)
    && typeof step.bubble?.deviceId === "string"
    && typeof step.bubble?.title === "string"
    && typeof step.bubble?.description === "string";
}

function validatedConversations(value: unknown): Readonly<Record<HostConversationId, HostConversation>> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const entries = value as Partial<Record<HostConversationId, HostConversation>>;

  for (const id of conversationIds) {
    const conversation = entries[id];
    if (!conversation || conversation.id !== id || !conversation.label || !conversation.summary) return undefined;
    const parsed = safeParsePacketFlowScenario(conversation.scenario);
    if (!parsed.success || !Array.isArray(conversation.stepRoles)) return undefined;
    if (conversation.stepRoles.length !== parsed.data.steps.length || !conversation.stepRoles.every(validRoleStep)) return undefined;
  }

  return entries as Readonly<Record<HostConversationId, HostConversation>>;
}

function anchorStyle(x: number): CSSProperties {
  return { "--host-role-anchor": `${x / 8}%` } as CSSProperties;
}

function RoleOverlay({ conversation, step, showBubble }: Readonly<{
  conversation: HostConversation;
  step: HostConversationStep;
  showBubble: boolean;
}>): ReactNode {
  const client = conversation.scenario.devices.find(({ id }) => id === step.clientId);
  const server = conversation.scenario.devices.find(({ id }) => id === step.serverId);
  const bubbleDevice = conversation.scenario.devices.find(({ id }) => id === step.bubble.deviceId);

  return (
    <div className="host-role-conversation__overlay" aria-hidden={showBubble ? undefined : true}>
      {client ? (
        <span
          className="host-role-conversation__role-label"
          data-active-role={step.bubble.deviceId === client.id ? "client" : undefined}
          data-role-for={client.id}
          style={anchorStyle(client.x)}
        >Client</span>
      ) : null}
      {server ? (
        <span
          className="host-role-conversation__role-label"
          data-active-role={step.bubble.deviceId === server.id ? "server" : undefined}
          data-role-for={server.id}
          style={anchorStyle(server.x)}
        >Server</span>
      ) : null}
      {showBubble && bubbleDevice ? (
        <aside
          aria-atomic="true"
          aria-live="polite"
          className="host-role-conversation__cloud"
          data-device-id={bubbleDevice.id}
          role="status"
          style={anchorStyle(bubbleDevice.x)}
        >
          <svg aria-hidden="true" className="host-role-conversation__cloud-shape" preserveAspectRatio="none" viewBox="0 0 330 250">
            <path d="M65 192 C34 195 21 164 40 143 C19 121 34 89 63 87 C57 55 88 34 116 48 C132 18 171 17 190 42 C212 15 249 24 259 54 C289 49 307 80 293 105 C316 126 307 161 279 171 C273 199 238 211 213 194 C195 221 154 225 134 199 C108 218 76 211 65 192 Z" />
            <circle cx="52" cy="211" r="13" />
            <circle cx="34" cy="228" r="8" />
            <circle cx="20" cy="240" r="5" />
          </svg>
          <div className="host-role-conversation__cloud-content">
            <p className="host-role-conversation__eyebrow">{step.bubble.eyebrow}</p>
            <h4>{step.bubble.title}</h4>
            <p>{step.bubble.description}</p>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

export function HostRoleConversationPlayer({ conversations = hostRoleConversations }: HostRoleConversationPlayerProps) {
  const validated = validatedConversations(conversations);
  const [conversationId, setConversationId] = useState<HostConversationId>("web-request");
  const [hasStarted, setHasStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  if (!validated) {
    return (
      <aside aria-label="Host conversation overview" className="network-basics-exercise" role="note">
        <h3>Clients and servers have different roles</h3>
        <p>A client asks for a service and a server responds. The same host can perform either role in different conversations.</p>
      </aside>
    );
  }

  const conversation = validated[conversationId];
  const roleStep = conversation.stepRoles[stepIndex] ?? conversation.stepRoles[0];

  const selectConversation = (nextId: HostConversationId) => {
    if (nextId === conversationId) return;
    setConversationId(nextId);
    setHasStarted(false);
    setStepIndex(0);
  };

  return (
    <section
      aria-labelledby="host-role-conversation-title"
      className="network-basics-exercise host-role-conversation"
      data-active-device={hasStarted ? roleStep.bubble.deviceId : undefined}
      data-started={hasStarted ? "true" : "false"}
    >
      <h3 id="host-role-conversation-title">Follow a host conversation</h3>
      <p>Choose an example, then follow who asks for a service and who responds.</p>
      <div aria-label="Choose a host conversation" className="host-role-conversation__choices" role="group">
        {conversationIds.map((id) => (
          <button
            aria-pressed={conversationId === id}
            className="network-basics-exercise__control"
            data-selected={conversationId === id || undefined}
            key={id}
            onClick={() => selectConversation(id)}
            type="button"
          >{validated[id].label}</button>
        ))}
      </div>
      <PacketFlowPlayer
        allowMotionOverride
        autoplay={false}
        key={conversation.scenario.id}
        onPlaybackStart={() => setHasStarted(true)}
        onStepChange={(index) => setStepIndex(index)}
        packetMotion="dhcp-css"
        packetTravelDurationMs={1500}
        scenario={conversation.scenario}
        showStepSummary={false}
        suppressHeading
        topologyOverlay={<RoleOverlay conversation={conversation} showBubble={hasStarted} step={roleStep} />}
      />
    </section>
  );
}
