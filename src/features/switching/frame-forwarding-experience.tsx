"use client";

import { useMemo } from "react";

import { FrameForwardingLab } from "./frame-forwarding-lab";
import { publicSwitchingComparison } from "./switching.data";
import { safeParseSwitchingCatalog } from "./switching.schema";

function EvidenceWorkflow() {
  return (
    <section aria-labelledby="switching-evidence-workflow">
      <h3 id="switching-evidence-workflow">Evidence-first switching workflow</h3>
      <ol>
        <li>Define the affected hosts, traffic direction, and local scope.</li>
        <li>Verify physical link and port state before interpreting the forwarding table.</li>
        <li>Identify the observed ingress port and every expected eligible egress port.</li>
        <li>Read the source MAC, destination MAC, and whether the destination is unicast or broadcast.</li>
        <li>Inspect the forwarding table and whether its entries are current.</li>
        <li>Compare observed behavior with known forwarding, filtering, or flooding.</li>
        <li>Change one condition, repeat the same test, and record the result.</li>
      </ol>
    </section>
  );
}

export function FrameForwardingExperience({ scenarios, showAdvancedShortcut = true }: {
  scenarios: unknown;
  showAdvancedShortcut?: boolean;
}) {
  const catalog = useMemo(
    () => safeParseSwitchingCatalog({ comparison: publicSwitchingComparison, scenarios }),
    [scenarios],
  );

  return (
    <section aria-labelledby="forward-the-frame">
      {catalog.success ? (
        <FrameForwardingLab scenarios={catalog.data.scenarios} showAdvancedShortcut={showAdvancedShortcut} />
      ) : (
        <div>
          <h3>Frame-forwarding lab unavailable</h3>
          <p>The authored scenarios could not be validated safely. Use the static workflow below.</p>
        </div>
      )}
      <EvidenceWorkflow />
    </section>
  );
}
