import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { WiresharkCheck } from "./wireshark-check";

it("renders the guided capture format used by account lessons", () => {
  render(<WiresharkCheck displayFilter="bootp">Capture one DHCP exchange.</WiresharkCheck>);
  expect(screen.getByText("bootp")).toBeVisible();
  expect(screen.getByText("Capture one DHCP exchange.")).toBeVisible();
  expect(screen.queryByText("Fields to inspect")).not.toBeInTheDocument();
});
