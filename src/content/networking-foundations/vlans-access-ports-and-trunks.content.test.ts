import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const publicLesson = readFileSync(join(process.cwd(), "src/content/networking-foundations/vlans-access-ports-and-trunks.public.mdx"), "utf8");
const accountLesson = readFileSync(join(process.cwd(), "src/content/networking-foundations/vlans-access-ports-and-trunks.account.mdx"), "utf8");

describe("VLAN lesson content contract", () => {
  it("places the VLAN membership player in the public lesson", () => {
    expect(publicLesson).toContain("<VlanMembershipPlayer progressItemId=");
  });

  it("places the 802.1Q tag journey player in the public lesson", () => {
    expect(publicLesson).toContain("<VlanTagJourneyPlayer progressItemId=");
  });

  it("places the router-on-a-stick journey beside the routing boundary explanation", () => {
    expect(publicLesson).toContain("<RouterOnStickPlayer />");
  });

  it("keeps account evidence in the protected block", () => {
    expect(accountLesson).toContain("VLAN_ACCOUNT_SENTINEL");
    expect(publicLesson).not.toContain("VLAN_ACCOUNT_SENTINEL");
  });

  it("protects the essential public explanations and static fallback", () => {
    for (const phrase of ["office teams", "not a security boundary", "VLAN is not a subnet", "normally untagged", "0x8100", "new FCS", "allowed VLAN", "Layer 3 device", "Spanning Tree Protocol", "link aggregation"]) {
      expect(publicLesson).toContain(phrase);
    }
    expect(publicLesson).toContain("endpoint sends an ordinarily untagged frame");
  });

  it("includes protected evidence, scenarios, checks, interview practice and Pro preview", () => {
    for (const phrase of ["Port evidence table", "Sanitized tagged-frame evidence", "Scenario 1", "Scenario 2", "Scenario 3", "native VLAN mismatch", "allowed VLAN mismatch", "advanced inter-VLAN paths", "Pro Member Waitlist"]) {
      expect(accountLesson).toContain(phrase);
    }
    expect(accountLesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(accountLesson).toContain("<InterviewScenario");
    expect(accountLesson).toContain("<PremiumPreview");
  });

  it("does not leak protected troubleshooting answers into public content", () => {
    expect(publicLesson).not.toContain("native VLAN mismatch");
    expect(publicLesson).not.toContain("allowed VLAN mismatch");
  });
});
