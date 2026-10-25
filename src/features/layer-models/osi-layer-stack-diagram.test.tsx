import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OsiLayerStackDiagram } from "./osi-layer-stack-diagram";

afterEach(cleanup);

describe("OsiLayerStackDiagram", () => {
  it("renders all seven layers, numbered top to bottom, with a caption each", () => {
    const { container } = render(<OsiLayerStackDiagram />);

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(7);

    const names = ["Application", "Presentation", "Session", "Transport", "Network", "Data Link", "Physical"];
    items.forEach((item, index) => {
      expect(item).toHaveAttribute("data-osi-layer", String(7 - index));
      expect(within(item).getByText(names[index])).toBeVisible();
      expect(item.querySelector(".osi-stack-diagram__number")).toHaveTextContent(String(7 - index));
    });

    for (const icon of container.querySelectorAll(".osi-stack-diagram__marker")) {
      expect(icon).toHaveAttribute("aria-hidden", "true");
    }
  });
});
