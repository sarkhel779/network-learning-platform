import { NetworkDeviceSymbol } from "../packet-flow/network-device-symbol";

export function HubPortOverview() {
  return (
    <figure className="hub-intro-figure" aria-label="Four hosts connected to a hub">
      <figcaption>The laptop sends to the server. The hub repeats to all three hosts.</figcaption>
      <div className="hub-intro-cable-topology" role="region" aria-label="Hub cable diagram; scroll horizontally on small screens" tabIndex={0}>
        <svg className="hub-intro-network" viewBox="0 0 800 450" role="img" aria-label="Laptop cable enters hub port 1. Separate cables from ports 2, 3 and 4 lead to the workstation, printer and server.">
          <g className="hub-intro-wires">
            <path data-hub-cable="laptop-port-1" d="M129 200 H278" />
            <path data-hub-cable="port-2-workstation" d="M362 160 H445 V55 H611" />
            <path data-hub-cable="port-3-printer" d="M362 200 H609" />
            <path data-hub-cable="port-4-server" d="M362 240 H445 V345 H615" />
          </g>
          <g className="hub-intro-signal-arrows" aria-hidden="true">
            <path d="M210 191 L222 200 L210 209 M550 46 L562 55 L550 64 M550 191 L562 200 L550 209 M550 336 L562 345 L550 354" />
          </g>
          <g className="hub-intro-hub-body">
            <rect x="270" y="140" width="100" height="120" rx="8" />
            <rect x="270" y="190" width="16" height="20" rx="2" />
            <rect x="354" y="150" width="16" height="20" rx="2" />
            <rect x="354" y="190" width="16" height="20" rx="2" />
            <rect x="354" y="230" width="16" height="20" rx="2" />
          </g>
          <g className="hub-intro-port-numbers"><text x="298" y="207">1</text><text x="340" y="167">2</text><text x="340" y="207">3</text><text x="340" y="247">4</text></g>
          <NetworkDeviceSymbol kind="laptop" transform="translate(100 200)" />
          <NetworkDeviceSymbol kind="host" transform="translate(640 55)" />
          <NetworkDeviceSymbol kind="printer" transform="translate(640 200)" />
          <NetworkDeviceSymbol kind="server" transform="translate(640 345)" />
          <g className="hub-intro-device-labels" textAnchor="middle">
            <text x="100" y="253">Laptop</text><text x="320" y="123">Hub</text>
            <text x="640" y="105">Workstation</text><text x="640" y="253">Printer</text><text x="640" y="395">Server</text>
          </g>
          <g className="hub-intro-outcome-labels" textAnchor="middle">
            <text x="100" y="278">Sender</text>
            <text x="640" y="130">Not for me — ignored</text><text x="640" y="278">Not for me — ignored</text>
            <text x="640" y="420" className="hub-intro-accepted">For me — accepted</text>
            <text x="320" y="302">Repeats the signal</text><text x="320" y="326">to ports 2, 3 and 4</text>
          </g>
        </svg>
      </div>
      <p className="hub-intro-note">Lines are Ethernet cables; arrows show this transmission&apos;s direction. Each numbered socket is a hub port. The hub repeats the signal to every other port—not back to the sender. Only the server accepts this frame because it is addressed to the server.</p>
    </figure>
  );
}

export function HubSharedMediumOverview() {
  return (
    <figure className="hub-intro-figure" aria-label="One shared communication space">
      <figcaption>Separate cables, one shared communication space</figcaption>
      <div className="hub-intro-shared">
        <strong>Laptop · Workstation · Printer · Server</strong>
        <div className="hub-intro-capacity">One shared pool of capacity — not a separate allowance for each port</div>
        <div className="hub-intro-collision"><span>Laptop transmits →</span><strong>Signals can collide</strong><span>← Server transmits at the same time</span></div>
      </div>
      <p className="hub-intro-note">More active senders share this capacity. A collision means overlapping transmissions interfere; the sending hosts must try again. The detailed recovery process belongs in the Physical Layer module.</p>
    </figure>
  );
}
