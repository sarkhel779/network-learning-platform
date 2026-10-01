"use client";

import { useState } from "react";

import { NetworkDeviceSymbol } from "@/features/packet-flow/network-device-symbol";
import { HostDeviceIcon } from "./host-device-icon";

type RouterPosition = "network-boundary" | "inside-office-lan";

export function RouterBoundaryPlacement() {
  const [position, setPosition] = useState<RouterPosition>();
  const correct = position === "network-boundary";

  return (
    <section className="network-basics-exercise router-boundary-placement" aria-labelledby="router-title">
      <h3 id="router-title">Place the router</h3>
      <p>Routers connect different IP networks. Select the position that joins the Office LAN to the Internet.</p>

      <div className="router-boundary-placement__topology">
        <strong className="router-boundary-placement__network-label router-boundary-placement__lan-label">Office LAN</strong>
        <strong className="router-boundary-placement__network-label router-boundary-placement__internet-label">Internet</strong>

        <div className="router-boundary-placement__device router-boundary-placement__host">
          <HostDeviceIcon kind="laptop" />
          <strong>Laptop</strong>
          <span>host</span>
        </div>

        <div aria-label="Switch" className="router-boundary-placement__device router-boundary-placement__switch" role="img">
          <svg aria-hidden="true" viewBox="0 0 80 70">
            <NetworkDeviceSymbol kind="switch" transform="translate(40 34)" />
          </svg>
          <strong>Switch</strong>
          <span>connects the LAN</span>
        </div>

        <button
          aria-label="Between Office LAN and Internet"
          aria-pressed={position === "network-boundary"}
          className="router-boundary-placement__choice router-boundary-placement__boundary-choice"
          data-router-position="network-boundary"
          data-selected={position === "network-boundary" ? "true" : undefined}
          onClick={() => setPosition("network-boundary")}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 80 70">
            <NetworkDeviceSymbol kind="router" transform="translate(40 34)" />
          </svg>
          <span>Place router here</span>
        </button>

        <button
          aria-label="Between the laptop and switch"
          aria-pressed={position === "inside-office-lan"}
          className="router-boundary-placement__choice router-boundary-placement__lan-choice"
          data-router-position="inside-office-lan"
          data-selected={position === "inside-office-lan" ? "true" : undefined}
          onClick={() => setPosition("inside-office-lan")}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 80 70">
            <NetworkDeviceSymbol kind="router" transform="translate(40 34)" />
          </svg>
          <span>Place router here</span>
        </button>

        <div aria-label="Internet" className="router-boundary-placement__device router-boundary-placement__provider" role="img">
          <svg aria-hidden="true" viewBox="0 0 80 70">
            <NetworkDeviceSymbol kind="provider" transform="translate(40 34)" />
          </svg>
          <strong>Internet</strong>
          <span>another network</span>
        </div>
      </div>

      {position ? (
        <p className={`network-basics-exercise__result ${correct ? "is-correct" : "is-incorrect"}`} role="status">
          {correct
            ? "Correct boundary — the router joins the Office LAN to the Internet and can act as the LAN hosts' default gateway."
            : "That position is inside one network. The switch connects hosts within the Office LAN; place the router at the boundary to another network."}
        </p>
      ) : null}
    </section>
  );
}
