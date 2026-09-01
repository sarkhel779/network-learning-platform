import type { DeviceProfile } from "./hosts-and-devices.schema";

type DeviceDetailsProps = Readonly<{
  profile: DeviceProfile;
  journeyId: string;
  onClose: () => void;
}>;

function Explanation({ label, children }: Readonly<{ label: string; children: string }>) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function DeviceDetails({ profile, journeyId, onClose }: DeviceDetailsProps) {
  const headingId = `${profile.deviceId}-details-heading`;

  return (
    <section className="device-details" aria-labelledby={headingId}>
      <div className="device-details__header">
        <div>
          <p className="device-details__category">{profile.category.replace("-", " ")}</p>
          <h3 id={headingId}>{profile.name}</h3>
        </div>
        <button type="button" onClick={onClose} aria-label="Close device details">
          Close
        </button>
      </div>

      <p>{profile.summary}</p>
      <p><strong>Simple analogy:</strong> {profile.analogy}</p>

      <dl className="device-details__explanations">
        <Explanation label="Purpose">{profile.purpose}</Explanation>
        <Explanation label="Traffic role">{profile.trafficRole}</Explanation>
        <Explanation label="Addressing">{profile.addressing}</Explanation>
        <Explanation label="What happens to the packet">{profile.packetBehavior}</Explanation>
        <Explanation label="What you can observe">{profile.evidence}</Explanation>
        <Explanation label="Common failure">{profile.commonFailure}</Explanation>
        <Explanation label="Current journey">{profile.journeyNotes[journeyId]}</Explanation>
      </dl>

      <details>
        <summary>Technical details</summary>
        <p>{profile.technicalDetails}</p>
      </details>
    </section>
  );
}
