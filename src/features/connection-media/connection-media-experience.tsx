"use client";

import { useMemo } from "react";

import { ConnectionMediaLab } from "./connection-media-lab";
import { accountConnectionScenarios } from "./connection-media.account.data";
import { publicConnectionMedia } from "./connection-media.data";
import { safeParseConnectionMediaCatalog } from "./connection-media.schema";

// Import this composition only from the server-authorized account MDX module.
// The shared MDX registry must not import it or its protected scenario dataset.
export function ConnectionMediaExperience({ scenarios = accountConnectionScenarios }: { scenarios?: unknown }) {
  const catalog = useMemo(
    () => safeParseConnectionMediaCatalog({ media: publicConnectionMedia, scenarios }),
    [scenarios],
  );

  return (
    <section aria-labelledby="design-a-connection">
      <div className="encapsulation-player__controls">
        <button type="button" onClick={() => document.getElementById("design-a-connection")?.focus()}>
          I know this—proceed to advanced
        </button>
      </div>
      <h2 id="design-a-connection" tabIndex={-1} aria-describedby="connection-design-context">Design a connection</h2>
      <p id="connection-design-context">
        Practise foundational and intermediate scenarios and troubleshooting. Review the requirements, choose a medium, and check your reasoning.
      </p>
      {catalog.success ? (
        <ConnectionMediaLab scenarios={catalog.data.scenarios} />
      ) : (
        <div>
          <h3>Connection design lab unavailable</h3>
          <p>The scenario requirements could not be loaded safely. Use the static troubleshooting workflow below.</p>
        </div>
      )}
      <section aria-labelledby="connection-troubleshooting-workflow">
        <h3 id="connection-troubleshooting-workflow">Evidence-first troubleshooting workflow</h3>
        <ol>
          <li>Define the symptom and scope: one device, one link, or several users.</li>
          <li>Check power, connection, and link state. A lit indicator does not prove end-to-end connectivity.</li>
          <li>Compare negotiated speed and duplex where applicable.</li>
          <li>Inspect distance, cable condition, connector seating, and fibre component compatibility.</li>
          <li>For wireless, inspect signal strength and interference. Low throughput alone does not identify the cause.</li>
          <li>Change one variable at a time.</li>
          <li>Retest and record the evidence before replacing equipment or changing more settings.</li>
        </ol>
      </section>
    </section>
  );
}
