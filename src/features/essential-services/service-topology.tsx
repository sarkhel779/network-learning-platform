import type { ServiceId, ServiceStep } from "./essential-services.schema";

const labels: Record<ServiceId, string> = {
  web: "Web", "remote-access": "Remote access", email: "Email",
  "file-transfer": "File transfer", time: "Time", monitoring: "Monitoring",
};

export function serviceLabel(service: ServiceId) {
  return labels[service];
}

export function ServiceTopology({ service, step, previousStep }: { service: ServiceId; step: ServiceStep; previousStep?: ServiceStep }) {
  const isReply = previousStep !== undefined && previousStep.sender === step.receiver && previousStep.receiver === step.sender;
  const left = isReply ? step.receiver : step.sender;
  const right = isReply ? step.sender : step.receiver;
  return <div className={isReply ? "service-topology service-topology--reverse" : "service-topology"} role="region" aria-label="Active service exchange">
    <span className="service-topology__endpoint">{left}</span>
    <span className="service-topology__link" aria-label={`${step.sender} to ${step.receiver}`}>
      <span className="sr-only">{step.sender} to {step.receiver}</span>
      <span key={step.id} className="service-topology__packet" data-packet-envelope="true" data-step={step.id} aria-hidden="true">✉</span>
    </span>
    <span className="service-topology__endpoint">{right}</span>
    <span className="service-topology__service">{serviceLabel(service)}</span>
  </div>;
}
