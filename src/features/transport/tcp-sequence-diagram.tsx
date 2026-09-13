import type { TcpJourneyStep } from "./tcp-journeys";
import { TransportPacketTrack } from "./transport-packet-track";

export function TcpSequenceDiagram({ steps, activeIndex, clientState, serverState }: {
  steps: readonly TcpJourneyStep[];
  activeIndex: number;
  clientState: string;
  serverState: string;
}) {
  const packets = steps.map((step, index) => ({ step, index })).filter(({ step }) => step.direction !== "none");
  return <div className="tcp-sequence" role="group" aria-label="TCP packet sequence">
    <div className="tcp-sequence__heads"><div><strong>Client</strong><span>Client: {clientState}</span></div><div><strong>Server</strong><span>Server: {serverState}</span></div></div>
    <ol className="tcp-sequence__timeline">
      {packets.map(({ step, index }) => <li key={step.id} data-active={index === activeIndex} data-direction={step.direction}>
        <span className="tcp-sequence__label">{step.flags.join(", ")} · seq {step.sequenceNumber ?? "—"}{step.acknowledgementNumber !== null ? ` · ACK ${step.acknowledgementNumber}` : ""}</span>
        <span className="tcp-sequence__arrow" aria-hidden="true">{index === activeIndex ? <TransportPacketTrack stepId={step.id} direction={step.direction === "client-to-server" ? "forward" : "reverse"} /> : null}</span>
      </li>)}
    </ol>
    {steps[activeIndex]?.direction === "none" ? <p className="tcp-sequence__state">{steps[activeIndex].outcome}</p> : null}
  </div>;
}
