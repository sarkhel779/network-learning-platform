import { hostsAndDevicesLab } from "./hosts-and-devices.data";

export function HostsAndDevicesStaticOverview() {
  return (
    <section aria-labelledby="static-topology-guide" className="static-topology-guide">
      <h3 id="static-topology-guide">Static topology guide</h3>
      <p><strong>Local wired path:</strong> Wired PC → Layer 2 switch → local server.</p>
      <p><strong>Local wireless path:</strong> Wireless laptop → access point → Layer 2 switch → local server.</p>
      <p><strong>Remote extension:</strong> From the Layer 2 switch, traffic continues through the gateway and firewall to the remote server. Replies follow the return path toward the original host.</p>
      <div className="static-topology-guide__devices">
        {hostsAndDevicesLab.profiles.map((profile) => (
          <section key={profile.deviceId}>
            <h4>{profile.name}</h4>
            <p>{profile.summary}</p>
          </section>
        ))}
      </div>
    </section>
  );
}
