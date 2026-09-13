import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { HeaderSearch } from "./header-search";

const lessons = [
  { title: "Subnetting Fundamentals", objective: "Divide an IPv4 network into subnets.", href: "/learn/networking-foundations/subnetting-fundamentals" },
  { title: "DNS Name Resolution", objective: "Follow a DNS query.", href: "/learn/networking-foundations/dns-and-name-resolution" },
];

afterEach(cleanup);

describe("header lesson search", () => {
  it("finds a published lesson by title and links to its lesson page", async () => {
    const user = userEvent.setup();
    render(<HeaderSearch lessons={lessons} />);

    await user.type(screen.getByRole("searchbox", { name: "Search lessons" }), "SUBNET");

    expect(screen.getByRole("link", { name: /Subnetting Fundamentals/ })).toHaveAttribute("href", "/learn/networking-foundations/subnetting-fundamentals");
    expect(screen.queryByRole("link", { name: /DNS Name Resolution/ })).not.toBeInTheDocument();
  });

  it("finds lessons by objective and provides a useful empty state", async () => {
    const user = userEvent.setup();
    render(<HeaderSearch lessons={lessons} />);
    const input = screen.getByRole("searchbox", { name: "Search lessons" });

    await user.type(input, "ipv4");
    expect(screen.getByRole("link", { name: /Subnetting Fundamentals/ })).toBeVisible();

    await user.clear(input);
    await user.type(input, "nonexistent topic");
    expect(screen.getByText("No matching lessons yet.")).toBeVisible();
  });
});
