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

it("keeps the same two boxes in place and reverses the packet's travel direction for a reply step", () => {
  const [request, response] = serviceScenarios.web.steps;
  expect(request.sender).toBe("browser");
  expect(response.sender).toBe("web-server");

  const { container: requestContainer } = render(<ServiceTopology service="web" step={request} />);
  expect(requestContainer.querySelector(".service-topology--reverse")).not.toBeInTheDocument();
  const requestEndpoints = Array.from(requestContainer.querySelectorAll(".service-topology__endpoint")).map((el) => el.textContent);
  expect(requestEndpoints).toEqual(["browser", "web-server"]);

  const { container: responseContainer } = render(<ServiceTopology service="web" step={response} previousStep={request} />);
  expect(responseContainer.querySelector(".service-topology--reverse")).toBeInTheDocument();
  const responseEndpoints = Array.from(responseContainer.querySelectorAll(".service-topology__endpoint")).map((el) => el.textContent);
  expect(responseEndpoints).toEqual(["browser", "web-server"]);
});

it("does not treat an unrelated step as a reply even if it shares the client name", () => {
  const [request, , alternateHttp] = serviceScenarios.web.steps;
  const { container } = render(<ServiceTopology service="web" step={alternateHttp} previousStep={request} />);
  expect(container.querySelector(".service-topology--reverse")).not.toBeInTheDocument();
});
