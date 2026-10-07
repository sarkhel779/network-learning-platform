"use client";

import { useId, useState } from "react";

import { NetworkCanvas, type CanvasNode } from "../network-canvas";
import type { LinkTypeSimConfig } from "./link-type-simulator-types";

export function LinkTypeSimulator({ config }: { config: LinkTypeSimConfig }) {
  const id = useId();
  const [linkType, setLinkType] = useState(config.defaultLinkType);
  const [testValue, setTestValue] = useState(config.defaultTestValue);
  const [packetAt, setPacketAt] = useState<string | null>(null);
  const [blockedAt, setBlockedAt] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean } | null>(null);

  const selectedOption = config.linkOptions.find((option) => option.value === linkType)!;
  const success = !selectedOption.vlan || selectedOption.vlan === testValue;

  function sendTestFrame() {
    setSending(true);
    setResult(null);
    setBlockedAt(null);
    setPacketAt("source");
    window.setTimeout(() => {
      setPacketAt("midA");
      window.setTimeout(() => {
        if (success) {
          setPacketAt("midB");
          window.setTimeout(() => {
            setPacketAt("dest");
            setResult({ success: true });
            setSending(false);
          }, 900);
        } else {
          setBlockedAt("midA");
          setResult({ success: false });
          setSending(false);
        }
      }, 900);
    }, 50);
  }

  const sourceLabel = config.testOptions ? `${config.sourceLabel} (VLAN ${testValue})` : config.sourceLabel;
  const destLabel = config.testOptions ? `${config.destLabel} (VLAN ${testValue})` : config.destLabel;

  const nodes: CanvasNode[] = [
    { id: "source", x: 15, y: 50, label: sourceLabel, icon: config.sourceIcon, state: packetAt === "source" ? "active" : "idle" },
    { id: "midA", x: 40, y: 50, label: config.middleLabelA, icon: config.middleIconA, state: blockedAt === "midA" ? "blocked" : packetAt === "midA" ? "active" : "idle" },
    { id: "midB", x: 60, y: 50, label: config.middleLabelB, icon: config.middleIconB, state: packetAt === "midB" ? "active" : "idle" },
    { id: "dest", x: 85, y: 50, label: destLabel, icon: config.destIcon, state: packetAt === "dest" ? "active" : "idle" },
  ];
  const links = [{ from: "source", to: "midA" }, { from: "midA", to: "midB" }, { from: "midB", to: "dest" }];

  return (
    <section aria-label={config.title} className="sample-lab">
      <div className="sample-lab__panel acl-sim">
        <NetworkCanvas ariaLabel={config.canvasAriaLabel} nodes={nodes} links={links} packetAt={packetAt} />

        <div className="acl-sim__controls">
          <p>{config.prompt}</p>
          <label htmlFor={`${id}-link`}>
            {config.configurableLinkFieldLabel}
            <select id={`${id}-link`} value={linkType} onChange={(event) => { setLinkType(event.target.value); setResult(null); }}>
              {config.linkOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          {config.testOptions ? (
            <label htmlFor={`${id}-test`}>
              Test frame
              <select id={`${id}-test`} value={testValue} onChange={(event) => { setTestValue(event.target.value); setResult(null); }}>
                {config.testOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          ) : null}
          <button type="button" onClick={sendTestFrame} disabled={sending}>Send test frame</button>
        </div>

        {result ? (
          <p role="status" className="acl-sim__result" data-outcome={result.success ? "permit" : "blocked"}>
            {result.success
              ? `Delivered. ${selectedOption.label} carries this traffic through to the destination.`
              : `Blocked. ${selectedOption.label} doesn't carry this VLAN, so the frame never makes it past ${config.middleLabelA}.`}
          </p>
        ) : null}
      </div>
    </section>
  );
}
