"use client";

import { useId, useState } from "react";

import { HostIcon, RouterIcon, ServerIcon } from "../hop-icons";
import { NetworkCanvas, type CanvasNode } from "../network-canvas";
import type { AclSimConfig, AclSimRule } from "./acl-simulator-types";

const links = [{ from: "host", to: "router" }, { from: "router", to: "destination" }];

type Result = { outcome: "permit" | "deny"; matchedLabel: string };

export function AclSimulator({ config }: { config: AclSimConfig }) {
  const id = useId();
  const nodes: CanvasNode[] = [
    { id: "host", x: 15, y: 50, label: "Host", icon: <HostIcon /> },
    { id: "router", x: 50, y: 50, label: "Router", sublabel: config.routerSublabel, icon: <RouterIcon /> },
    { id: "destination", x: 85, y: 50, label: config.destinationLabel ?? "Destination", sublabel: config.destinationSublabel, icon: <ServerIcon /> },
  ];
  const [rules, setRules] = useState<AclSimRule[]>(config.rules);
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(config.rules.map((rule) => [rule.id, rule.enabledByDefault])),
  );
  const [sourceIp, setSourceIp] = useState(config.sourceOptions[0].ip);
  const [direction, setDirection] = useState<"in" | "out">(config.directionToggle?.correctDirection === "out" ? "in" : "out");
  const [packetAt, setPacketAt] = useState<string | null>("host");
  const [routerBlocked, setRouterBlocked] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [sending, setSending] = useState(false);

  function moveRule(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= rules.length) return;
    if (!rules[index].reorderable || !rules[target].reorderable) return;
    const next = [...rules];
    [next[index], next[target]] = [next[target], next[index]];
    setRules(next);
    setResult(null);
  }

  function toggleRule(ruleId: string) {
    setEnabled((prev) => ({ ...prev, [ruleId]: !prev[ruleId] }));
    setResult(null);
  }

  function evaluate(): Result {
    if (config.directionToggle && direction !== config.directionToggle.correctDirection) {
      return { outcome: "permit", matchedLabel: `ACL applied '${direction}' never inspects this traffic` };
    }
    for (const rule of rules) {
      if (!enabled[rule.id]) continue;
      if (rule.matchIp === "any" || rule.matchIp === sourceIp) {
        return { outcome: rule.action === "permit" ? "permit" : "deny", matchedLabel: rule.text };
      }
    }
    return { outcome: "deny", matchedLabel: "(implicit) deny any" };
  }

  function sendTestPacket() {
    setSending(true);
    setResult(null);
    setRouterBlocked(false);
    setPacketAt("host");
    window.setTimeout(() => {
      setPacketAt("router");
      window.setTimeout(() => {
        const outcome = evaluate();
        setResult(outcome);
        if (outcome.outcome === "permit") {
          setPacketAt("destination");
        } else {
          setRouterBlocked(true);
        }
        setSending(false);
      }, 900);
    }, 50);
  }

  const canvasNodes: CanvasNode[] = nodes.map((node) => {
    if (node.id === "router") return { ...node, state: routerBlocked ? "blocked" : packetAt === "router" ? "active" : "idle" };
    return { ...node, state: packetAt === node.id ? "active" : "idle" };
  });

  return (
    <section aria-label={config.title} className="sample-lab">
      <div className="sample-lab__panel acl-sim">
        <NetworkCanvas ariaLabel={config.canvasAriaLabel} nodes={canvasNodes} links={links} packetAt={packetAt} />

        <fieldset className="acl-sim__rules" aria-label="ACL rules">
          <legend>{config.rulesLegend ?? "ACL rules, in evaluation order"}</legend>
          {rules.map((rule, index) => (
            <div key={rule.id} className={`acl-sim__rule ${!rule.reorderable ? "acl-sim__rule--fixed" : ""}`}>
              {rule.toggleable ? (
                <label>
                  <input type="checkbox" checked={enabled[rule.id]} onChange={() => toggleRule(rule.id)} />
                </label>
              ) : null}
              <code>{rule.text}</code>
              {rule.reorderable ? (
                <span className="acl-sim__rule-move">
                  <button type="button" aria-label={`Move "${rule.text}" up`} disabled={index === 0 || !rules[index - 1]?.reorderable} onClick={() => moveRule(index, -1)}>↑</button>
                  <button type="button" aria-label={`Move "${rule.text}" down`} disabled={index === rules.length - 1 || !rules[index + 1]?.reorderable} onClick={() => moveRule(index, 1)}>↓</button>
                </span>
              ) : null}
            </div>
          ))}
          <div className="acl-sim__rule acl-sim__rule--fixed"><code>(implicit) deny any</code></div>
        </fieldset>

        <div className="acl-sim__controls">
          <p>{config.prompt}</p>
          <label htmlFor={`${id}-source`}>
            Test packet source
            <select id={`${id}-source`} value={sourceIp} onChange={(event) => { setSourceIp(event.target.value); setResult(null); }}>
              {config.sourceOptions.map((option) => <option key={option.ip} value={option.ip}>{option.label}</option>)}
            </select>
          </label>
          {config.directionToggle ? (
            <label htmlFor={`${id}-direction`} className="acl-sim__toggle">
              {config.directionToggle.label}
              <select id={`${id}-direction`} value={direction} onChange={(event) => { setDirection(event.target.value as "in" | "out"); setResult(null); }}>
                <option value="in">in</option>
                <option value="out">out</option>
              </select>
            </label>
          ) : null}
          <button type="button" onClick={sendTestPacket} disabled={sending}>Send test packet</button>
        </div>

        {result ? (
          <p role="status" className="acl-sim__result" data-outcome={result.outcome}>
            {result.outcome === "permit" ? "Permitted. " : "Blocked. "}
            Matched: <code>{result.matchedLabel}</code>
          </p>
        ) : null}
      </div>
    </section>
  );
}
