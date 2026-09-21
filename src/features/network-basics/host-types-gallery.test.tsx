import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HostTypesGallery } from "./host-types-gallery";

describe("HostTypesGallery", () => {
  it("introduces the reusable host categories with distinct device icons", () => {
    const { container } = render(<HostTypesGallery />);

    for (const name of [
      "Desktop or workstation",
      "Laptop",
      "Phone or tablet",
      "Network printer",
      "IP camera",
      "IoT device",
      "Physical server",
      "Cloud or virtual server",
    ]) expect(screen.getByRole("heading", { level: 4, name })).toBeVisible();

    expect(container.querySelectorAll("[data-host-device-icon]")).toHaveLength(8);
    expect(new Set([...container.querySelectorAll("[data-host-device-icon]")].map((icon) => icon.getAttribute("data-host-device-icon"))).size).toBe(8);
  });
});
