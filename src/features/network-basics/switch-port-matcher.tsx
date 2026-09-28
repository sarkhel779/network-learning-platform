"use client";

import { useState } from "react";

import { NetworkDeviceSymbol } from "@/features/packet-flow/network-device-symbol";
import { HostDeviceIcon, type HostDeviceIconKind } from "./host-device-icon";

const switchPorts = [
  { id: "port-1", label: "Port 1", device: "Workstation", icon: "desktop" },
  { id: "port-2", label: "Port 2", device: "Server", icon: "physical-server" },
  { id: "port-3", label: "Port 3", device: "Printer", icon: "printer" },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  device: string;
  icon: HostDeviceIconKind;
}>;

export function SwitchPortMatcher() {
  const [selectedPort, setSelectedPort] = useState<string>();
  const correct = selectedPort === "port-3";

  return (
    <section className="network-basics-exercise switch-port-matcher" aria-labelledby="switch-title">
      <h3 id="switch-title">Match a host to a switch port</h3>
      <p>Switch ports connect local devices. Follow the printer cable, then choose the port the switch should use.</p>

      <div className="switch-port-matcher__topology" data-selected-port={selectedPort}>
        <div className="switch-port-matcher__device switch-port-matcher__source">
          <HostDeviceIcon kind="laptop" />
          <strong>Laptop</strong>
          <span>sending host</span>
        </div>

        <div aria-hidden="true" className="switch-port-matcher__inbound-path">
          {selectedPort ? <span className="switch-port-matcher__packet" /> : null}
        </div>

        <div aria-label="Switch" className="switch-port-matcher__switch" role="img">
          <svg aria-hidden="true" viewBox="0 0 80 70">
            <NetworkDeviceSymbol kind="switch" transform="translate(40 34)" />
          </svg>
          <strong>Switch</strong>
          <span>local connector</span>
        </div>

        <div aria-label="Choose the printer's switch port" className="switch-port-matcher__ports" role="group">
          {switchPorts.map((port) => {
            const selected = selectedPort === port.id;
            const isCorrectPath = selected && port.id === "port-3";
            return (
              <button
                aria-label={`${port.label} — ${port.device}`}
                aria-pressed={selected}
                className="switch-port-matcher__port"
                data-correct={isCorrectPath ? "true" : undefined}
                data-port-path={port.id}
                data-selected={selected ? "true" : undefined}
                key={port.id}
                onClick={() => setSelectedPort(port.id)}
                type="button"
              >
                <span aria-hidden="true" className="switch-port-matcher__branch">
                  {selected ? <span className="switch-port-matcher__packet" /> : null}
                </span>
                <HostDeviceIcon kind={port.icon} />
                <span className="switch-port-matcher__port-copy">
                  <strong>{port.label}</strong>
                  <span>{port.device}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="switch-port-matcher__prompt">Which labelled port leads to the printer?</p>
      {selectedPort ? (
        <p className={`network-basics-exercise__result ${correct ? "is-correct" : "is-incorrect"}`} role="status">
          {correct
            ? "Correct — the printer cable leads to Port 3, so that is the path the switch uses in this example."
            : "Try again — trace each cable from the switch to its connected device."}
        </p>
      ) : null}
    </section>
  );
}
