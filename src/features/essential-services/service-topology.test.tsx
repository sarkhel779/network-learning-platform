import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { serviceScenarios } from "./service-scenarios";
import { ServiceTopology } from "./service-topology";

it("animates a packet from the sender to the receiver for each service step", () => {
  const step = serviceScenarios.web.steps[0];
  const { container } = render(<ServiceTopology service="web" step={step} />);
  expect(container.querySelector('[data-packet-envelope="true"]')).toBeInTheDocument();
  expect(container.querySelector('[data-packet-envelope="true"]')).toHaveAttribute("data-step", step.id);
});
