"use client";

import { useState } from "react";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { DeviceDetails } from "./device-details";
import { hostsAndDevicesLab } from "./hosts-and-devices.data";

export function HostsAndDevicesExperience() {
  const [journeyId, setJourneyId] = useState(hostsAndDevicesLab.journeys[0].id);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>();
  const journey = hostsAndDevicesLab.journeys.find(({ id }) => id === journeyId)
    ?? hostsAndDevicesLab.journeys[0];
  const selectedProfile = hostsAndDevicesLab.profiles.find(
    ({ deviceId }) => deviceId === selectedDeviceId,
  );

  return (
    <section className="hosts-devices-experience" aria-label="Hosts and devices packet journeys">
      <fieldset className="journey-selector">
        <legend>Choose a packet journey</legend>
        <div className="journey-selector__choices">
          {hostsAndDevicesLab.journeys.map((choice) => (
            <label key={choice.id}>
              <input
                type="radio"
                name="hosts-devices-journey"
                value={choice.id}
                aria-label={choice.label}
                checked={journeyId === choice.id}
                onChange={() => {
                  setJourneyId(choice.id);
                  setSelectedDeviceId(undefined);
                }}
              />
              <span>
                <strong>{choice.label}</strong>
                <small>{choice.shortDescription}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <PacketFlowExperience
        key={journey.id}
        scenario={journey.scenario}
        headingId="compare-journeys"
        suppressHeading
        selectedDeviceId={selectedDeviceId}
        onDeviceSelect={setSelectedDeviceId}
      />

      {selectedProfile ? (
        <DeviceDetails
          profile={selectedProfile}
          journeyId={journey.id}
          onClose={() => setSelectedDeviceId(undefined)}
        />
      ) : null}
    </section>
  );
}
