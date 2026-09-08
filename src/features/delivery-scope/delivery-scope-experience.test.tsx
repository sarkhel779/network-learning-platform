import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { accountDeliveryScenarios } from "./delivery-scope.account.scenarios";
import { DeliveryScopeExperience } from "./delivery-scope-experience";

describe("DeliveryScopeExperience", () => {
  it("renders the validated account lab", () => {
    render(<DeliveryScopeExperience scenarios={accountDeliveryScenarios} />);
    expect(screen.getByRole("heading", { name: "Predict traffic delivery" })).toBeVisible();
  });

  it("renders a useful static evidence fallback for malformed props", () => {
    render(<DeliveryScopeExperience scenarios={{ broken: true }} />);
    expect(screen.getByRole("heading", { name: "Delivery-scope lab unavailable" })).toBeVisible();
    expect(screen.getByText(/destination address/i)).toBeVisible();
  });
});
