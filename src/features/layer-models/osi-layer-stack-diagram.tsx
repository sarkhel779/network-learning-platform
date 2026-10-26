type LayerIconKind = "application" | "presentation" | "session" | "transport" | "network" | "data-link" | "physical";

const STACK_LAYERS = [
  { number: 7, name: "Application", icon: "application", caption: "Opens the video-call app and starts the request to your friend." },
  { number: 6, name: "Presentation", icon: "presentation", caption: "Translates, compresses, then encrypts (TLS) your webcam video." },
  { number: 5, name: "Session", icon: "session", caption: "Opens one call session through the app's API and keeps it alive." },
  { number: 4, name: "Transport", icon: "transport", caption: "Separates the call's audio/video (UDP) from chat (TCP) by port." },
  { number: 3, name: "Network", icon: "network", caption: "Addresses every packet with your friend's IP address." },
  { number: 2, name: "Data Link", icon: "data-link", caption: "Frames each packet for the next hop, such as your Wi-Fi router." },
  { number: 1, name: "Physical", icon: "physical", caption: "Sends the frame as Wi-Fi radio waves or light in a fiber line." },
] as const satisfies readonly { number: number; name: string; icon: LayerIconKind; caption: string }[];

function LayerIcon({ kind }: { kind: LayerIconKind }) {
  const common = { "aria-hidden": true, viewBox: "0 0 32 32", className: "osi-stack-diagram__icon-svg" } as const;

  if (kind === "application") {
    return <svg {...common}><rect x="5" y="7" width="22" height="18" rx="2" /><path d="M5 12h22" /><circle cx="9" cy="9.5" r="0.9" fill="currentColor" stroke="none" /></svg>;
  }
  if (kind === "presentation") {
    return <svg {...common}><rect x="9" y="15" width="14" height="11" rx="2" /><path d="M12 15v-4a4 4 0 0 1 8 0v4" /></svg>;
  }
  if (kind === "session") {
    return <svg {...common}><circle cx="16" cy="16" r="10" /><path d="M16 10v6l4 3" /></svg>;
  }
  if (kind === "transport") {
    return <svg {...common}><path d="M6 11h8M6 21h8" /><path d="M14 11l6-3M14 21l6 3" /><circle cx="22" cy="8" r="1.4" fill="currentColor" stroke="none" /><circle cx="22" cy="24" r="1.4" fill="currentColor" stroke="none" /></svg>;
  }
  if (kind === "network") {
    return <svg {...common}><circle cx="16" cy="16" r="10" /><path d="M6 16h20M16 6c3 4 3 16 0 20M16 6c-3 4-3 16 0 20" /></svg>;
  }
  if (kind === "data-link") {
    return <svg {...common}><rect x="4" y="12" width="9" height="8" rx="2" /><rect x="19" y="12" width="9" height="8" rx="2" /><path d="M13 16h6" /></svg>;
  }
  return <svg {...common}><path d="M16 25v-2.5" /><path d="M11.3 19.3a6.5 6.5 0 0 1 9.4 0" /><path d="M7.5 15.5a12 12 0 0 1 17 0" /></svg>;
}

export function OsiLayerStackDiagram() {
  return (
    <div className="osi-stack-diagram" data-osi-layer-stack-diagram>
      <p className="osi-stack-diagram__intro">
        The same seven layers, drawn as a stack. Data starts at Application and works down to
        Physical as it leaves your laptop for the call.
      </p>
      <ol className="osi-stack-diagram__list">
        {STACK_LAYERS.map((layer) => (
          <li className="osi-stack-diagram__layer" data-osi-layer={layer.number} key={layer.number}>
            <span className="osi-stack-diagram__marker" aria-hidden="true">
              <LayerIcon kind={layer.icon} />
              <span className="osi-stack-diagram__number">{layer.number}</span>
            </span>
            <span className="osi-stack-diagram__text">
              <strong>{layer.name}</strong>
              <span>{layer.caption}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
