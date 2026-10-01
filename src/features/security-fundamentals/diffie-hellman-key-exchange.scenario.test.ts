import { describe, expect, it } from "vitest";

import { diffieHellmanKeyExchangeScenario } from "./diffie-hellman-key-exchange.scenario";

const fieldsFor = (stepId: string) => {
  const step = diffieHellmanKeyExchangeScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

describe("Diffie-Hellman key exchange scenario", () => {
  it("parses with Alice, Bob, and an eavesdropping Eve", () => {
    expect(diffieHellmanKeyExchangeScenario.devices.map((device) => device.id)).toEqual(["alice", "bob", "eve"]);
    expect(diffieHellmanKeyExchangeScenario.links.map((link) => link.id)).toEqual(["alice-bob"]);
  });

  it("agrees on public parameters before any private value exists", () => {
    expect(summaryValue("agree-on-public-parameters", "Prime (p)")).toBe("23");
    expect(summaryValue("agree-on-public-parameters", "Generator (g)")).toBe("5");
  });

  it("exchanges public values without ever transmitting the private exponents", () => {
    expect(summaryValue("alice-generates-private-key", "Alice's private value (a)")).toContain("never sent");
    expect(summaryValue("alice-sends-public-value", "A = g^a mod p")).toBe("5^6 mod 23 = 8");
    expect(summaryValue("bob-generates-private-key", "Bob's private value (b)")).toContain("never sent");
    expect(summaryValue("bob-sends-public-value", "B = g^b mod p")).toBe("5^15 mod 23 = 19");
  });

  it("derives the identical shared secret independently on both sides", () => {
    expect(summaryValue("alice-computes-shared-secret", "Alice's shared secret")).toBe("19^6 mod 23 = 2");
    expect(summaryValue("bob-computes-shared-secret", "Bob's shared secret")).toBe("8^15 mod 23 = 2");
    expect(fieldsFor("bob-computes-shared-secret").stateNote).toMatch(/without it ever being transmitted/i);
  });

  it("shows Eve cannot compute the secret from the public values alone", () => {
    expect(summaryValue("eve-cannot-compute-secret", "Eve knows")).toBe("p, g, A, B");
    expect(summaryValue("eve-cannot-compute-secret", "Eve cannot derive")).toContain("shared secret");
    expect(fieldsFor("eve-cannot-compute-secret").detailFields[0]?.value).toMatch(/discrete logarithm/i);
  });
});
