"use client";

import { useRef, useState } from "react";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { DeviceDetails } from "./device-details";
import { hostsAndDevicesLab } from "./hosts-and-devices.data";

export function HostsAndDevicesExperience({ progressItemId }: { progressItemId?: string }) {
  const experienceRef = useRef<HTMLElement>(null);
  const [journeyId, setJourneyId] = useState(hostsAndDevicesLab.journeys[0].id);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>();
  const [autoplay, setAutoplay] = useState(true);
  const journey = hostsAndDevicesLab.journeys.find(({ id }) => id === journeyId)
    ?? hostsAndDevicesLab.journeys[0];
  const selectedProfile = hostsAndDevicesLab.profiles.find(
    ({ deviceId }) => deviceId === selectedDeviceId,
  );

  function closeDeviceDetails() {
    const trigger = experienceRef.current?.querySelector<SVGGElement>(
      `[data-device-id="${selectedDeviceId}"][role="button"]`,
    );
    setSelectedDeviceId(undefined);
    trigger?.focus();
  }

  return (
    <section ref={experienceRef} className="hosts-devices-experience" aria-label="Hosts and devices packet journeys">
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
                  setAutoplay(false);
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
        autoplay={autoplay}
        progressItemId={progressItemId}
      />

      {selectedProfile ? (
        <DeviceDetails
          profile={selectedProfile}
          journeyId={journey.id}
          onClose={closeDeviceDetails}
        />
      ) : null}
    </section>
  );
}
