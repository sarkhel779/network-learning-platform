"use client";

import { useState } from "react";
import { NetworkDeviceSymbol } from "../packet-flow/network-device-symbol";

export function InterfaceAddressDiagram() {
  const [networkB, setNetworkB] = useState(false);
  return (
    <figure id="one-interface-two-addresses" className="interface-address" aria-label="One network interface, two kinds of address">
      <figcaption>One interface. Two addresses. Different jobs.</figcaption>
      <div className="interface-address__choices" role="group" aria-label="Choose the example network">
        <button type="button" aria-pressed={!networkB} onClick={() => setNetworkB(false)}>Join network A</button>
        <button type="button" aria-pressed={networkB} onClick={() => setNetworkB(true)}>Join network B</button>
      </div>
      <div className="interface-address__layout">
        <div className="interface-address__laptop">
          <svg viewBox="-50 -40 100 90" role="img" aria-label="Laptop"><NetworkDeviceSymbol kind="laptop" /></svg>
          <strong>Same laptop</strong><span>Same Ethernet interface</span>
        </div>
        <div className="interface-address__card">
          <svg viewBox="0 0 180 95" role="img" aria-label="Enlarged Ethernet network interface card, with a cable socket and controller chip">
            <rect x="10" y="8" width="158" height="70" rx="5" />
            <rect x="22" y="24" width="34" height="34" /><path d="M29 24 V36 M36 24 V36 M43 24 V36 M50 24 V36 M57 41 H85 M85 26 V58 H118 V26 Z M118 42 H151 M43 58 V70 H92 M103 58 V70 H145" />
            <path d="M83 78 V87 M94 78 V87 M105 78 V87 M116 78 V87 M127 78 V87 M138 78 V87" />
          </svg>
          <strong>Ethernet network interface (NIC)</strong>
          <p>This is the laptop&apos;s connection to the network. Both addresses below belong to this interface.</p>
          <div className="interface-address__addresses">
            <div><strong>MAC · local-link identity</strong><code>02:1A:2B:3C:4D:5E</code><span>Kept the same in this example</span></div>
            <div><strong>IP · logical network address</strong><code>{networkB ? "198.51.100.20" : "192.0.2.10"}</code><span>Assigned for network {networkB ? "B" : "A"}</span></div>
          </div>
        </div>
        <div className="interface-address__network"><svg viewBox="-50 -40 100 90" role="img" aria-label="Switch on the selected network"><NetworkDeviceSymbol kind="switch" /></svg><strong>Network {networkB ? "B" : "A"}</strong><span>Example Ethernet LAN</span></div>
      </div>
      <p role="status" aria-live="polite">{networkB ? "Now on network B: the IP address changed, while this interface kept the same MAC address." : "On network A: this interface has both a MAC address and an IP address."}</p>
      <p className="interface-address__note">A NIC may be built in, an expansion card, or a USB adapter; this drawing shows an expansion card. These are teaching addresses, not live settings. MAC addresses can also be changed or randomized—physical does not mean permanent.</p>
    </figure>
  );
}
