import { HostDeviceIcon } from "./host-device-icon";
import { NetworkDeviceSymbol } from "../packet-flow/network-device-symbol";

export function HostInterfaceOverview() {
  return <figure className="host-intro-figure" aria-label="Two ways a laptop can join a network">
    <figcaption>Two ways a laptop can join a network</figcaption>
    <div className="host-intro-connections">
      <div className="host-intro-connection">
        <h3>Wired: Ethernet</h3>
        <div className="host-intro-connection__path">
          <div><HostDeviceIcon kind="laptop" /><strong>Laptop</strong><span>Ethernet interface</span></div>
          <span className="host-intro-connection__link">Ethernet cable</span>
          <div><svg viewBox="0 0 80 80" aria-hidden="true"><NetworkDeviceSymbol kind="switch" transform="translate(40 40)" /></svg><strong>Switch</strong></div>
        </div>
        <p>The laptop&apos;s Ethernet interface connects to a switch through a cable.</p>
      </div>
      <div className="host-intro-connection">
        <h3>Wireless: Wi-Fi</h3>
        <div className="host-intro-connection__path">
          <div><HostDeviceIcon kind="laptop" /><strong>Laptop</strong><span>Wi-Fi interface</span></div>
          <span className="host-intro-connection__link host-intro-connection__link--wireless">Wi-Fi radio link</span>
          <div><svg viewBox="0 0 80 80" aria-hidden="true"><NetworkDeviceSymbol kind="access-point" transform="translate(40 40)" /></svg><strong>Access point</strong></div>
        </div>
        <p>The laptop&apos;s Wi-Fi interface connects by radio to a wireless access point.</p>
      </div>
    </div>
    <p className="host-intro-figure__note">These are separate examples. A laptop can have both interfaces; it does not need to use both to join a network.</p>
  </figure>;
}

export function ClientServerOverview() {
  return <figure className="host-intro-figure" aria-label="Client requests a service; server responds">
    <figcaption>Same conversation, two different jobs</figcaption>
    <div className="host-intro-roles">
      <div className="host-intro-role"><HostDeviceIcon kind="laptop" /><strong>Laptop</strong><span>Browser application</span><b>Client</b><p>Requests a service</p></div>
      <div className="host-intro-roles__exchange"><p>Client → Server: request a page</p><p>Server → Client: return the page</p></div>
      <div className="host-intro-role"><HostDeviceIcon kind="physical-server" /><strong>Web server host</strong><span>Web server application</span><b>Server</b><p>Provides the service</p></div>
    </div>
    <p className="host-intro-figure__note">This shows application roles, not the physical cable path. Network devices between the hosts are omitted.</p>
  </figure>;
}
