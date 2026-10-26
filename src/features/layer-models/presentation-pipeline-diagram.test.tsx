import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PresentationPipelineDiagram } from "./presentation-pipeline-diagram";

afterEach(cleanup);

describe("PresentationPipelineDiagram", () => {
  it("renders the six-stage round trip in order, with the four named transitions", () => {
    const { container } = render(<PresentationPipelineDiagram />);

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(6);

    const names = ["Original data", "Compressed", "Encrypted", "Encrypted", "Compressed", "Original data"];
    const kickers = [null, "Compress", "Encrypt (TLS/SSL)", "Travels the network", "Decrypt", "Decompress"];

    items.forEach((item, index) => {
      expect(item).toHaveAttribute("data-pipeline-step", String(index + 1));
      expect(within(item).getByText(names[index])).toBeVisible();
      const kicker = kickers[index];
      if (kicker) expect(within(item).getByText(kicker)).toBeVisible();
    });

    for (const marker of container.querySelectorAll(".presentation-pipeline__marker")) {
      expect(marker).toHaveAttribute("aria-hidden", "true");
    }
  });
});
