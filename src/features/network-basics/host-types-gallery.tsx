import { HostDeviceIcon, type HostDeviceIconKind } from "./host-device-icon";

const hostTypes: readonly { kind: HostDeviceIconKind; name: string; description: string }[] = [
  { kind: "desktop", name: "Desktop or workstation", description: "A fixed computer used at a desk for work, study, or specialist applications." },
  { kind: "laptop", name: "Laptop", description: "A portable computer that can join wired or wireless networks." },
  { kind: "mobile", name: "Phone or tablet", description: "A mobile host that uses applications and network services while moving between networks." },
  { kind: "printer", name: "Network printer", description: "A host that receives print jobs through its own network interface." },
  { kind: "camera", name: "IP camera", description: "A camera that sends video or images through a network connection." },
  { kind: "iot", name: "IoT device", description: "A sensor, appliance, or controller that exchanges small amounts of useful data." },
  { kind: "physical-server", name: "Physical server", description: "A dedicated computer that provides services to other hosts." },
  { kind: "cloud-server", name: "Cloud or virtual server", description: "A software-defined server that is still a host even when its physical machine is hidden from the user." },
];

export function HostTypesGallery() {
  return (
    <section aria-label="Examples of network hosts" className="host-types-gallery">
      {hostTypes.map(({ kind, name, description }) => (
        <article className="host-types-gallery__card" key={kind}>
          <HostDeviceIcon kind={kind} />
          <div><h4>{name}</h4><p>{description}</p></div>
        </article>
      ))}
    </section>
  );
}
