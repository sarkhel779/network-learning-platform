import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const publicLesson = readFileSync(join(process.cwd(), "src/content/networking-foundations/vlans-access-ports-and-trunks.public.mdx"), "utf8");
const accountLesson = readFileSync(join(process.cwd(), "src/content/networking-foundations/vlans-access-ports-and-trunks.account.mdx"), "utf8");

describe("VLAN lesson content contract", () => {
  it("places the VLAN membership player in the public lesson", () => {
    expect(publicLesson).toContain("<VlanMembershipPlayer />");
  });

  it("places the 802.1Q tag journey player in the public lesson", () => {
    expect(publicLesson).toContain("<VlanTagJourneyPlayer />");
  });

  it("keeps account evidence in the protected block", () => {
    expect(accountLesson).toContain("VLAN_ACCOUNT_SENTINEL");
    expect(publicLesson).not.toContain("VLAN_ACCOUNT_SENTINEL");
  });
});
