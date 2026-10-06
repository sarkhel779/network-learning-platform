"use client";

import { useId, useState } from "react";

import { CloudIcon, RouterIcon, ServerIcon } from "../hop-icons";
import { NetworkCanvas, type CanvasNode } from "../network-canvas";
import { NatTablePanel } from "./nat-table-panel";

type Target = "public" | "private" | "newpublic";

type Result = { outcome: "delivered" | "blocked"; explanation: string };

const links = [{ from: "client", to: "router" }, { from: "router", to: "server" }];

export function StaticNatSimulator() {
  const id = useId();
  const [target, setTarget] = useState<Target>("public");
  const [extraEntry, setExtraEntry] = useState(false);
  const [packetAt, setPacketAt] = useState<string | null>("client");
  const [routerBlocked, setRouterBlocked] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [sending, setSending] = useState(false);

  function evaluate(): Result {
    if (target === "public") {
      return { outcome: "delivered", explanation: "203.0.113.5 has a static NAT entry mapping it to 192.168.1.10 — the router translates and forwards it." };
    }
    if (target === "private") {
      return { outcome: "blocked", explanation: "192.168.1.10 is a private address. It isn't routable on the internet, so there's no way to reach it directly from outside — NAT or not." };
    }
    if (extraEntry) {
      return { outcome: "delivered", explanation: "With a new static entry mapping 203.0.113.6 to 192.168.1.20, the router now knows how to translate and forward this request too." };
    }
    return { outcome: "blocked", explanation: "203.0.113.6 has no NAT entry configured yet, so the router has nothing to translate it to and drops the request." };
  }

  function sendTestPacket() {
    setSending(true);
    setResult(null);
    setRouterBlocked(false);
    setPacketAt("client");
    window.setTimeout(() => {
      setPacketAt("router");
      window.setTimeout(() => {
        const outcome = evaluate();
        setResult(outcome);
        if (outcome.outcome === "delivered") {
          setPacketAt("server");
        } else {
          setRouterBlocked(true);
        }
        setSending(false);
      }, 900);
    }, 50);
  }

  const nodes: CanvasNode[] = [
    { id: "client", x: 15, y: 50, label: "External client", sublabel: "Internet", icon: <CloudIcon />, state: packetAt === "client" ? "active" : "idle" },
    { id: "router", x: 50, y: 50, label: "NAT router", sublabel: "Static entries", icon: <RouterIcon />, state: routerBlocked ? "blocked" : packetAt === "router" ? "active" : "idle" },
    { id: "server", x: 85, y: 50, label: "Internal server(s)", icon: <ServerIcon />, state: packetAt === "server" ? "active" : "idle" },
  ];

  const tableRows = [{ private: "192.168.1.10:80", public: "203.0.113.5:80", note: "Static entry" }];
  if (extraEntry) tableRows.push({ private: "192.168.1.20:80", public: "203.0.113.6:80", note: "New static entry" });

  return (
    <section aria-label="Static NAT simulator" className="sample-lab">
      <div className="sample-lab__panel acl-sim">
        <NetworkCanvas ariaLabel="External client sending a test request through a static NAT router" nodes={nodes} links={links} packetAt={packetAt} />

        <NatTablePanel rows={tableRows} />

        <div className="acl-sim__controls">
          <p>Request each address below, then add a second static entry and test the new address too.</p>
          <label htmlFor={`${id}-target`}>
            Request address
            <select id={`${id}-target`} value={target} onChange={(event) => { setTarget(event.target.value as Target); setResult(null); }}>
              <option value="public">203.0.113.5 (public, mapped)</option>
              <option value="private">192.168.1.10 (private address directly)</option>
              <option value="newpublic">203.0.113.6 (new server)</option>
            </select>
          </label>
          <label className="acl-sim__toggle">
            <input type="checkbox" checked={extraEntry} onChange={() => { setExtraEntry((value) => !value); setResult(null); }} />
            Add a static entry for 192.168.1.20 ↔ 203.0.113.6
          </label>
          <button type="button" onClick={sendTestPacket} disabled={sending}>Send test packet</button>
        </div>

        {result ? (
          <p role="status" className="acl-sim__result" data-outcome={result.outcome === "delivered" ? "permit" : "blocked"}>
            {result.outcome === "delivered" ? "Delivered. " : "Blocked. "}
            {result.explanation}
          </p>
        ) : null}
      </div>
    </section>
  );
}
