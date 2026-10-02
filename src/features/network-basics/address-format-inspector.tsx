"use client";

import { useId, useState } from "react";

import { HostDeviceIcon } from "./host-device-icon";

type AddressSample = Readonly<{ address: string; format: "MAC" | "IPv4" | "IPv6" }>;

const samples: readonly AddressSample[] = [
  { address: "02:1A:2B:3C:4D:5E", format: "MAC" },
  { address: "00:00:5E:00:53:10", format: "MAC" },
  { address: "01:00:5E:00:00:FB", format: "MAC" },
  { address: "192.0.2.10", format: "IPv4" },
  { address: "2001:db8::10", format: "IPv6" },
];

const networks = [
  { name: "Home network", ip: "192.0.2.10" },
  { name: "Office network", ip: "198.51.100.10" },
] as const;

export function AddressFormatInspector() {
  const titleId = useId();
  const [networkIndex, setNetworkIndex] = useState(0);
  const [selected, setSelected] = useState<AddressSample>();
  const [firstOctet, setFirstOctet] = useState(2);
  const network = networks[networkIndex];
  const isMac = selected?.format === "MAC";
  const isGroup = (firstOctet & 1) !== 0;
  const isLocal = (firstOctet & 2) !== 0;
  const firstPair = firstOctet.toString(16).padStart(2, "0").toUpperCase();
  const binary = firstOctet.toString(2).padStart(8, "0");
  const address = isMac ? `${firstPair}${selected.address.slice(2)}` : selected?.address;
  const explanation = isMac
    ? `MAC address — I/G = ${isGroup ? 1 : 0}: ${isGroup ? "group" : "individual"} address. U/L = ${isLocal ? 1 : 0}: ${isLocal ? "locally" : "universally"} administered address.`
    : selected?.format === "IPv4"
      ? "IPv4 address — a logical address written in dotted decimal: four numbers separated by dots."
      : "IPv6 address — a logical address written in hexadecimal groups separated by colons. The double colon shortens a run of zero groups.";

  function selectSample(sample: AddressSample) {
    setSelected(sample);
    if (sample.format === "MAC") setFirstOctet(Number.parseInt(sample.address.slice(0, 2), 16));
  }

  return (
    <section className="network-basics-exercise address-inspector" aria-labelledby={titleId}>
      <h3 id={titleId}>Explore MAC and IP addresses</h3>
      <p>MAC and IP addresses have different jobs and recognizable written formats.</p>

      <div className="address-inspector__identity" role="group" aria-label="One interface, two addresses">
        <div className="address-inspector__device">
          <HostDeviceIcon kind="laptop" />
          <strong>Same laptop</strong>
          <span>same network interface</span>
        </div>
        <dl className="address-inspector__addresses">
          <div>
            <dt>Physical address · MAC</dt>
            <dd><code>02:1A:2B:3C:4D:5E</code></dd>
          </div>
          <div>
            <dt>Logical address · IPv4</dt>
            <dd><code>{network.ip}</code></dd>
          </div>
        </dl>
      </div>
      <div className="network-basics-exercise__controls" role="group" aria-label="Choose the example network">
        {networks.map(({ name }, index) => (
          <button
            aria-pressed={networkIndex === index}
            className={`network-basics-exercise__control${networkIndex === index ? " is-selected" : ""}`}
            key={name}
            onClick={() => setNetworkIndex(index)}
            type="button"
          >{name}</button>
        ))}
      </div>
      <p className="address-inspector__note">
        Switch networks to see the IP address change. In this example, the same interface keeps its MAC address.
        Real devices can also change or randomize their MAC addresses. These are teaching addresses.
      </p>

      <div className="address-inspector__samples">
        <h4>Inspect an address format</h4>
        <p>Choose a sample. For a MAC address, try changing the two highlighted bits.</p>
        <div className="network-basics-exercise__controls" role="group" aria-label="Address samples">
          {samples.map((sample) => (
            <button
              aria-pressed={selected?.address === sample.address}
              className={`network-basics-exercise__control network-basics-exercise__code${selected?.address === sample.address ? " is-selected" : ""}`}
              key={sample.address}
              onClick={() => selectSample(sample)}
              type="button"
            >{sample.address}</button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="address-inspector__detail">
          <p className="address-inspector__selected"><span>{selected.format} address</span><code aria-label="Selected address">{address}</code></p>
          {isMac ? (
            <>
              <div className="address-inspector__octet-heading">
                <span>First octet: <code>{firstPair}</code></span>
                <code aria-label="First octet in binary">{binary}</code>
              </div>
              <div className="address-inspector__bits" role="group" aria-label="Eight bits of the first MAC octet">
                {[...binary].map((bit, index) => index < 6 ? (
                  <span className="address-inspector__bit" key={index}><small>Bit {7 - index}</small><strong>{bit}</strong></span>
                ) : (
                  <button
                    aria-label={`Toggle ${index === 6 ? "U/L" : "I/G"} bit`}
                    aria-pressed={bit === "1"}
                    className="address-inspector__bit address-inspector__bit--editable"
                    key={index}
                    onClick={() => setFirstOctet((current) => current ^ (index === 6 ? 2 : 1))}
                    type="button"
                  ><small>{index === 6 ? "U/L" : "I/G"}</small><strong>{bit}</strong></button>
                ))}
              </div>
              <p className="address-inspector__note">I/G is the rightmost bit (bit 0). U/L is immediately to its left (bit 1).</p>
            </>
          ) : null}
          <p className="network-basics-exercise__result" role="status">{explanation}</p>
        </div>
      ) : null}
    </section>
  );
}
