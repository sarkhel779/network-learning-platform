"use client";

import { useId, useState } from "react";

import { HostIcon, ServerIcon, SwitchIcon } from "../hop-icons";
import { NetworkCanvas, type CanvasNode } from "../network-canvas";
import type { ArpFieldKey, ArpResolutionConfig } from "./arp-resolution-types";
import { andIp, ipToBinary, sameSubnet } from "./ip-math";

type Step = "idle" | "and" | "decision" | "request" | "reply" | "done";

function requestTarget(config: ArpResolutionConfig): { ip: string; mac: string } {
  return config.gateway ? { ip: config.gateway.ip, mac: config.gateway.mac } : { ip: config.destinationIp, mac: config.destinationMac };
}

const draftDefaults: Record<ArpFieldKey, (config: ArpResolutionConfig) => string> = {
  etherDest: (config) => requestTarget(config).mac.toLowerCase(),
  senderMac: () => "ff:ff:ff:ff:ff:ff",
  senderIp: (config) => requestTarget(config).ip,
  targetMac: (config) => requestTarget(config).mac.toLowerCase(),
  targetIp: (config) => config.hostIp,
  opcode: () => "2",
};

function draftValue(config: ArpResolutionConfig, key: ArpFieldKey): string {
  return config.draftOverrides?.[key] ?? draftDefaults[key](config);
}

function BinaryRow({ label, ip }: { label: string; ip: string }) {
  return (
    <div className="arp-and-step__row">
      <dt>{label}</dt>
      <dd>
        {ipToBinary(ip)} <span>({ip})</span>
      </dd>
    </div>
  );
}

export function ArpResolutionLab({ config }: { config: ArpResolutionConfig }) {
  const id = useId();
  const [step, setStep] = useState<Step>("idle");
  const [andSelected, setAndSelected] = useState("");
  const [andChecked, setAndChecked] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<ArpFieldKey, string>>(() =>
    Object.fromEntries(config.requestFields.map((field) => [field.key, draftValue(config, field.key)])) as Record<ArpFieldKey, string>,
  );
  const [fieldResults, setFieldResults] = useState<Partial<Record<ArpFieldKey, boolean>>>({});
  const [packetAt, setPacketAt] = useState<string | null>(null);
  const [blockedAt, setBlockedAt] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [decisionSelected, setDecisionSelected] = useState("");
  const [decisionChecked, setDecisionChecked] = useState(false);

  const andCorrect = andChecked && andSelected === config.andCorrectValue;
  const onSameSubnet = sameSubnet(config.hostIp, config.destinationIp, config.subnetMask);
  const decisionCorrect = decisionChecked && decisionSelected === config.decisionStep?.correctValue;

  function checkAnd() {
    setAndChecked(true);
  }

  function checkDecision() {
    const decision = config.decisionStep;
    if (!decision) return;
    if (decisionSelected === decision.correctValue) {
      setDecisionChecked(true);
      return;
    }
    setPacketAt("host");
    window.setTimeout(() => {
      setPacketAt(decision.dropAtNodeId);
      window.setTimeout(() => {
        setBlockedAt(decision.dropAtNodeId);
        setDecisionChecked(true);
      }, 900);
    }, 50);
  }

  function resetDecision() {
    setDecisionSelected("");
    setDecisionChecked(false);
    setBlockedAt(null);
    setPacketAt(null);
  }

  function setField(key: ArpFieldKey, value: string) {
    setFieldValues((current) => ({ ...current, [key]: value }));
    setFieldResults((current) => ({ ...current, [key]: undefined }));
  }

  function sendArpRequest() {
    const results = Object.fromEntries(
      config.requestFields.map((field) => [field.key, fieldValues[field.key] === field.correctValue]),
    ) as Record<ArpFieldKey, boolean>;
    setFieldResults(results);
    if (!Object.values(results).every(Boolean)) return;

    setSending(true);
    setBlockedAt(null);
    setPacketAt("host");
    window.setTimeout(() => {
      setPacketAt("switch");
      window.setTimeout(() => {
        setPacketAt("destination");
        window.setTimeout(() => {
          setStep("reply");
          setPacketAt("switch");
          window.setTimeout(() => {
            setPacketAt("host");
            window.setTimeout(() => {
              setStep("done");
              setSending(false);
            }, 900);
          }, 900);
        }, 700);
      }, 900);
    }, 50);
  }

  function restart() {
    setStep("idle");
    setAndSelected("");
    setAndChecked(false);
    setDecisionSelected("");
    setDecisionChecked(false);
    setFieldValues(Object.fromEntries(config.requestFields.map((field) => [field.key, draftValue(config, field.key)])) as Record<ArpFieldKey, string>);
    setFieldResults({});
    setPacketAt(null);
    setBlockedAt(null);
    setSending(false);
  }

  const thirdNode = config.gateway
    ? { label: config.gateway.label, sublabel: config.gateway.ip }
    : { label: config.destinationLabel, sublabel: config.destinationIp };
  function nodeState(nodeId: string): "idle" | "active" | "blocked" {
    if (blockedAt === nodeId) return "blocked";
    if (packetAt === nodeId) return "active";
    return "idle";
  }
  const nodes: CanvasNode[] = [
    { id: "host", x: 15, y: 50, label: config.hostLabel, sublabel: config.hostIp, icon: <HostIcon />, state: nodeState("host") },
    { id: "switch", x: 50, y: 50, label: "Switch", icon: <SwitchIcon />, state: nodeState("switch") },
    { id: "destination", x: 85, y: 50, label: thirdNode.label, sublabel: thirdNode.sublabel, icon: <ServerIcon />, state: nodeState("destination") },
  ];
  const links = [{ from: "host", to: "switch" }, { from: "switch", to: "destination" }];

  return (
    <section aria-label={config.title} className="sample-lab">
      <div className="sample-lab__panel acl-sim">
        <NetworkCanvas ariaLabel={config.canvasAriaLabel} nodes={nodes} links={links} packetAt={packetAt} />

        {step === "idle" ? (
          <div className="acl-sim__controls">
            <p>{config.intro}</p>
            <button type="button" onClick={() => setStep("and")}>Start</button>
          </div>
        ) : null}

        {step !== "idle" ? (
          <div className="arp-and-step">
            <p>{config.andQuestion}</p>
            <fieldset className="acl-sim__controls">
              <legend>Pick the operation</legend>
              {config.andOptions.map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name={`${id}-and`}
                    checked={andSelected === option.value}
                    disabled={step !== "and"}
                    onChange={() => { setAndSelected(option.value); setAndChecked(false); }}
                  />
                  {option.label}
                </label>
              ))}
              <button type="button" onClick={checkAnd} disabled={!andSelected || step !== "and"}>Check</button>
            </fieldset>
            {andChecked ? (
              andCorrect ? (
                <div className="arp-and-step__reveal">
                  <dl className="arp-and-step__table">
                    <BinaryRow label={`${config.hostLabel} IP`} ip={config.hostIp} />
                    <BinaryRow label="Subnet mask" ip={config.subnetMask} />
                    <BinaryRow label={`${config.hostLabel} AND mask`} ip={andIp(config.hostIp, config.subnetMask)} />
                    <BinaryRow label={`${config.destinationLabel} IP`} ip={config.destinationIp} />
                    <BinaryRow label="Subnet mask" ip={config.subnetMask} />
                    <BinaryRow label={`${config.destinationLabel} AND mask`} ip={andIp(config.destinationIp, config.subnetMask)} />
                  </dl>
                  <p role="status" className="acl-sim__result" data-outcome={onSameSubnet ? "permit" : "blocked"}>
                    {config.nextHopConclusion}
                  </p>
                  {step === "and" ? (
                    <button type="button" onClick={() => setStep(config.decisionStep ? "decision" : "request")}>Continue</button>
                  ) : null}
                </div>
              ) : (
                <p role="status" className="acl-sim__result" data-outcome="blocked">
                  Not correct. AND is the operation that keeps only the bits both the address and the mask agree are network bits — try again.
                </p>
              )
            ) : null}
          </div>
        ) : null}

        {config.decisionStep && (step === "decision" || step === "request" || step === "reply" || step === "done") ? (
          <div className="arp-and-step">
            <p>{config.decisionStep.prompt}</p>
            <fieldset className="acl-sim__controls">
              <legend>Pick one</legend>
              {config.decisionStep.options.map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name={`${id}-decision`}
                    checked={decisionSelected === option.value}
                    disabled={step !== "decision"}
                    onChange={() => { setDecisionSelected(option.value); setDecisionChecked(false); setBlockedAt(null); setPacketAt(null); }}
                  />
                  {option.label}
                </label>
              ))}
              <button type="button" onClick={checkDecision} disabled={!decisionSelected || step !== "decision"}>Check</button>
            </fieldset>
            {decisionChecked ? (
              decisionCorrect ? (
                <>
                  <p role="status" className="acl-sim__result" data-outcome="permit">{config.decisionStep.proceedExplanation}</p>
                  {step === "decision" ? <button type="button" onClick={() => setStep("request")}>Continue</button> : null}
                </>
              ) : (
                <>
                  <p role="status" className="acl-sim__result" data-outcome="blocked">{config.decisionStep.dropExplanation}</p>
                  {step === "decision" ? <button type="button" onClick={resetDecision}>Try again</button> : null}
                </>
              )
            ) : null}
          </div>
        ) : null}

        {step === "request" || step === "reply" || step === "done" ? (
          <div className="arp-fields">
            <h3>Draft ARP request</h3>
            <p>{config.requestIntro ?? `Host A has an ARP cache miss for ${requestTarget(config).ip}. Here's a draft of the request it's about to send — fix anything that's wrong, then send it.`}</p>
            {config.requestFields.map((field) => (
              <div
                key={field.key}
                className="arp-fields__field"
                data-status={fieldResults[field.key] === undefined ? "unknown" : fieldResults[field.key] ? "correct" : "incorrect"}
              >
                <label htmlFor={`${id}-${field.key}`}>{field.label}</label>
                <select
                  id={`${id}-${field.key}`}
                  value={fieldValues[field.key]}
                  disabled={step !== "request"}
                  onChange={(event) => setField(field.key, event.target.value)}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {fieldResults[field.key] === false ? <span className="arp-fields__flag">Not correct</span> : null}
              </div>
            ))}
            {step === "request" ? (
              <button type="button" onClick={sendArpRequest} disabled={sending}>Send ARP Request</button>
            ) : null}
          </div>
        ) : null}

        {step === "reply" || step === "done" ? (
          <div className="arp-fields arp-fields--reply">
            <h3>ARP reply</h3>
            {config.replyFields.map((field) => (
              <div key={field.label} className="arp-fields__field" data-status="correct">
                <span>{field.label}</span>
                <strong>{field.value}</strong>
              </div>
            ))}
          </div>
        ) : null}

        {step === "done" ? (
          <>
            <p role="status" className="acl-sim__result" data-outcome="permit">{config.cacheLearnedMessage}</p>
            <div className="sample-lab__controls">
              <button type="button" onClick={restart}>Restart</button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
