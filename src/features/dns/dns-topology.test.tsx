import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { resolutionScenarios } from "./resolution-journeys";
import { DnsTopology } from "./dns-topology";

it("moves a packet between the sender and receiver of the current DNS step", () => {
  const step = resolutionScenarios[0].steps[0];
  const { container } = render(<DnsTopology step={step} />);
  expect(container.querySelector('[data-packet-envelope="true"]')).toBeInTheDocument();
});
