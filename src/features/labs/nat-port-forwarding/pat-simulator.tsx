"use client";

import { useId, useState } from "react";

import { CloudIcon, HostIcon, RouterIcon } from "../hop-icons";
import { NetworkCanvas, type CanvasNode } from "../network-canvas";
import { NatTablePanel, type NatTableRow } from "./nat-table-panel";

type HostKey = "A" | "B";

const hostInfo: Record<HostKey, { privatePort: string; publicPort: string }> = {
  A: { privatePort: "192.168.1.10:5000", publicPort: "203.0.113.9:40001" },
  B: { privatePort: "192.168.1.11:5000", publicPort: "203.0.113.9:40002" },
};

const links = [{ from: "hostA", to: "router" }, { from: "hostB", to: "router" }, { from: "router", to: "internet" }];

export function PatSimulator() {
  const id = useId();
  const [selectedHost, setSelectedHost] = useState<HostKey>("A");
  const [sentHosts, setSentHosts] = useState<HostKey[]>([]);
  const [packetAt, setPacketAt] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [resultHost, setResultHost] = useState<HostKey | null>(null);

  function sendTestPacket() {
    setSending(true);
    setResultHost(null);
    setPacketAt(selectedHost === "A" ? "hostA" : "hostB");
    window.setTimeout(() => {
      setPacketAt("router");
      window.setTimeout(() => {
        setPacketAt("internet");
        setResultHost(selectedHost);
        setSentHosts((prev) => (prev.includes(selectedHost) ? prev : [...prev, selectedHost]));
        setSending(false);
      }, 900);
    }, 50);
  }

  const nodes: CanvasNode[] = [
    { id: "hostA", x: 15, y: 30, label: "Host A", sublabel: hostInfo.A.privatePort, icon: <HostIcon />, state: packetAt === "hostA" ? "active" : "idle" },
    { id: "hostB", x: 15, y: 70, label: "Host B", sublabel: hostInfo.B.privatePort, icon: <HostIcon />, state: packetAt === "hostB" ? "active" : "idle" },
    { id: "router", x: 50, y: 50, label: "NAT router", sublabel: "PAT / overload", icon: <RouterIcon />, state: packetAt === "router" ? "active" : "idle" },
    { id: "internet", x: 85, y: 50, label: "Internet server", icon: <CloudIcon />, state: packetAt === "internet" ? "active" : "idle" },
  ];

  const tableRows: NatTableRow[] = sentHosts.map((host) => ({ private: hostInfo[host].privatePort, public: hostInfo[host].publicPort, note: `Host ${host}` }));

  return (
    <section aria-label="PAT / NAT overload simulator" className="sample-lab">
      <div className="sample-lab__panel acl-sim">
        <NetworkCanvas ariaLabel="Two hosts sharing one public IP through PAT" nodes={nodes} links={links} packetAt={packetAt} />

        <NatTablePanel
          rows={tableRows.length ? tableRows : []}
          caption={tableRows.length < 2 ? "Send from both hosts to see them share one public IP with different ports." : "Both hosts share the same public IP; the port number is what keeps their sessions apart."}
        />

        <div className="acl-sim__controls">
          <p>Pick a host and send its traffic. Then pick the other host and send too — watch the table fill in with a second row.</p>
          <label htmlFor={`${id}-host`}>
            Send from
            <select id={`${id}-host`} value={selectedHost} onChange={(event) => setSelectedHost(event.target.value as HostKey)}>
              <option value="A">Host A</option>
              <option value="B">Host B</option>
            </select>
          </label>
          <button type="button" onClick={sendTestPacket} disabled={sending}>Send test packet</button>
        </div>

        {resultHost ? (
          <p role="status" className="acl-sim__result" data-outcome="permit">
            Host {resultHost}&apos;s traffic is translated to {hostInfo[resultHost].publicPort}. {sentHosts.length > 1 ? "Both hosts now share the same public IP, each with a different port." : "Send from the other host to see a second, distinct port assigned."}
          </p>
        ) : null}
      </div>
    </section>
  );
}
