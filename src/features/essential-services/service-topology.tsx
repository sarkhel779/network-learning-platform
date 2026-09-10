import type { ServiceId, ServiceStep } from "./essential-services.schema";

const labels: Record<ServiceId, string> = {
  web: "Web", "remote-access": "Remote access", email: "Email",
  "file-transfer": "File transfer", time: "Time", monitoring: "Monitoring",
};

export function serviceLabel(service: ServiceId) {
  return labels[service];
}

export function ServiceTopology({ service, step }: { service: ServiceId; step: ServiceStep }) {
  return <div className="service-topology" role="region" aria-label="Active service exchange">
    <span className="service-topology__endpoint">{step.sender}</span>
    <span className="service-topology__packet" aria-hidden="true">◆</span>
    <span className="service-topology__link">{step.sender} to {step.receiver}</span>
    <span className="service-topology__endpoint">{step.receiver}</span>
    <span className="service-topology__service">{serviceLabel(service)}</span>
  </div>;
}
