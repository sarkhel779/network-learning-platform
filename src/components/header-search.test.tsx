import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { HeaderSearch } from "./header-search";

afterEach(cleanup);

describe("header lesson search", () => {
  it("links only to a matching published lesson", async () => {
    render(<HeaderSearch lessons={[
      { title: "Subnetting Fundamentals", objective: "Divide an IPv4 network", href: "/learn/networking-foundations/subnetting-fundamentals" },
      { title: "DNS Name Resolution", objective: "Follow a DNS query", href: "/learn/networking-foundations/dns-and-name-resolution" },
    ]} />);
    await userEvent.setup().type(screen.getByRole("searchbox", { name: "Search lessons" }), "subnet");
    expect(screen.getByRole("link", { name: /Subnetting Fundamentals/ })).toHaveAttribute("href", "/learn/networking-foundations/subnetting-fundamentals");
    expect(screen.queryByRole("link", { name: /DNS Name Resolution/ })).toBeNull();
  });
});
