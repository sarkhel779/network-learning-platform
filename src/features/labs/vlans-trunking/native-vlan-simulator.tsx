"use client";

import { useId, useState } from "react";

import { SwitchIcon } from "../hop-icons";
import { NetworkCanvas, type CanvasNode } from "../network-canvas";

const links = [{ from: "switchA", to: "switchB" }];
const options = [
  { value: "1", label: "VLAN 1" },
  { value: "99", label: "VLAN 99" },
];

export function NativeVlanSimulator() {
  const id = useId();
  const [nativeA, setNativeA] = useState("1");
  const [nativeB, setNativeB] = useState("99");
  const [packetAt, setPacketAt] = useState<string | null>(null);
  const [mismatchFlagged, setMismatchFlagged] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ match: boolean } | null>(null);

  function sendFrame() {
    setSending(true);
    setResult(null);
    setMismatchFlagged(false);
    setPacketAt("switchA");
    window.setTimeout(() => {
      setPacketAt("switchB");
      const match = nativeA === nativeB;
      setResult({ match });
      if (!match) setMismatchFlagged(true);
      setSending(false);
    }, 900);
  }

  const nodes: CanvasNode[] = [
    { id: "switchA", x: 25, y: 50, label: "Switch A", sublabel: `Native VLAN ${nativeA}`, icon: <SwitchIcon />, state: packetAt === "switchA" ? "active" : "idle" },
    { id: "switchB", x: 75, y: 50, label: "Switch B", sublabel: `Native VLAN ${nativeB}`, icon: <SwitchIcon />, state: mismatchFlagged ? "blocked" : packetAt === "switchB" ? "active" : "idle" },
  ];

  return (
    <section aria-label="Native VLAN mismatch simulator" className="sample-lab">
      <div className="sample-lab__panel acl-sim">
        <NetworkCanvas ariaLabel="An untagged native VLAN frame crossing a trunk between two switches" nodes={nodes} links={links} packetAt={packetAt} />

        <div className="acl-sim__controls">
          <p>Set each switch&apos;s native VLAN, then send an untagged frame from Switch A and see how Switch B interprets it.</p>
          <label htmlFor={`${id}-a`}>
            Switch A native VLAN
            <select id={`${id}-a`} value={nativeA} onChange={(event) => { setNativeA(event.target.value); setResult(null); }}>
              {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label htmlFor={`${id}-b`}>
            Switch B native VLAN
            <select id={`${id}-b`} value={nativeB} onChange={(event) => { setNativeB(event.target.value); setResult(null); }}>
              {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <button type="button" onClick={sendFrame} disabled={sending}>Send untagged frame from Switch A</button>
        </div>

        {result ? (
          <p role="status" className="acl-sim__result" data-outcome={result.match ? "permit" : "blocked"}>
            {result.match
              ? `Delivered correctly. Both switches agree this untagged traffic is VLAN ${nativeA}.`
              : `Mismatch. Switch A sends it as native VLAN ${nativeA}, but Switch B's native VLAN is ${nativeB} — it treats the same untagged frame as VLAN ${nativeB}. This is how traffic leaks between VLANs.`}
          </p>
        ) : null}
      </div>
    </section>
  );
}
