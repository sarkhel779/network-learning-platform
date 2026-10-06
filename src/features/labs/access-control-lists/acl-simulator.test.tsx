import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { aclDirectionTroubleshootingSim } from "./acl-direction-troubleshooting-sim";
import { aclRuleOrderSim } from "./acl-rule-order-sim";
import { AclSimulator } from "./acl-simulator";
import { permitDenyBasicsSim } from "./permit-deny-basics-sim";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function sendAndSettle() {
  fireEvent.click(screen.getByRole("button", { name: "Send test packet" }));
  act(() => vi.advanceTimersByTime(1000));
}

describe("AclSimulator", () => {
  it("lets the learner toggle a missing permit-any rule and see the implicit deny take effect first", () => {
    vi.useFakeTimers();
    render(<AclSimulator config={permitDenyBasicsSim} />);

    fireEvent.change(screen.getByRole("combobox", { name: "Test packet source" }), { target: { value: "192.168.1.10" } });
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Blocked.");
    expect(screen.getByRole("status")).toHaveTextContent("(implicit) deny any");

    fireEvent.click(screen.getByRole("checkbox"));
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Permitted.");
    expect(screen.getByRole("status")).toHaveTextContent("20 permit any");
  });

  it("lets the learner reorder rules and see the deny actually take effect", () => {
    vi.useFakeTimers();
    render(<AclSimulator config={aclRuleOrderSim} />);

    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Permitted.");
    expect(screen.getByRole("status")).toHaveTextContent("10 permit any");

    fireEvent.click(screen.getByRole("button", { name: /Move "20 deny host 192.168.1.50" up/ }));
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Blocked.");
    expect(screen.getByRole("status")).toHaveTextContent("20 deny host 192.168.1.50");
  });

  it("lets the learner toggle ACL direction and see which one actually inspects the traffic", () => {
    vi.useFakeTimers();
    render(<AclSimulator config={aclDirectionTroubleshootingSim} />);

    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Permitted.");

    fireEvent.change(screen.getByRole("combobox", { name: /ACL direction/ }), { target: { value: "in" } });
    sendAndSettle();
    expect(screen.getByRole("status")).toHaveTextContent("Blocked.");
    expect(screen.getByRole("status")).toHaveTextContent("10 deny host 192.168.1.50");
  });

  it("disables the up-arrow for the first reorderable rule and the down-arrow for the last", () => {
    render(<AclSimulator config={aclRuleOrderSim} />);
    expect(screen.getByRole("button", { name: /Move "10 permit any" up/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Move "20 deny host 192.168.1.50" down/ })).toBeDisabled();
  });
});
