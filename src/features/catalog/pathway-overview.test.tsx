import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { getPathway } from "./catalog.repository";
import { PathwayOverview } from "./pathway-overview";

afterEach(cleanup);

describe("PathwayOverview", () => {
  it("renders the pathway and its planned lessons", () => {
    render(<PathwayOverview pathway={getPathway("networking-foundations")} />);

    expect(
      screen.getByRole("heading", { name: "Networking Foundations" }),
    ).toBeVisible();
    expect(screen.getByText(/complete beginners/i)).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(14);
  });

  it("links published lessons and marks unpublished lessons as coming later", () => {
    render(<PathwayOverview pathway={getPathway("networking-foundations")} />);

    const publishedLesson = screen.getByRole("link", {
      name: /how networks communicate/i,
    });
    expect(publishedLesson).toHaveAttribute(
      "href",
      "/learn/networking-foundations/how-networks-communicate",
    );
    expect(screen.getByRole("link", { name: /hosts and network devices/i })).toHaveAttribute(
      "href",
      "/learn/networking-foundations/hosts-and-network-devices",
    );
    const osiLesson = screen.getByRole("link", { name: /osi and tcp\/ip models/i });
    expect(osiLesson).toHaveAttribute(
      "href",
      "/learn/networking-foundations/osi-and-tcp-ip-models",
    );
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });
});
