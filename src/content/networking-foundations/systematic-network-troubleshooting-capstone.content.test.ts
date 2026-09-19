import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (tier: "public" | "account" | "pro") => readFileSync(join(process.cwd(), `src/content/networking-foundations/systematic-network-troubleshooting-capstone.${tier}.mdx`), "utf8");

describe("systematic troubleshooting capstone content", () => {
  it("teaches the complete public method without leaking protected answers", () => {
    const source = read("public");
    for (const topic of ["scope", "hypothesis", "predicted result", "least-destructive", "evidence", "restoration", "escalation"]) expect(source).toMatch(new RegExp(topic, "i"));
    expect(source).not.toMatch(/correctIndex|TroubleshootingWorkspace|wrong-access-vlan|stale-portal-dns/i);
  });

  it("places guided practice in account and sparse evidence work in Pro", () => {
    const account = read("account"); const pro = read("pro");
    expect(account).toMatch(/TroubleshootingWorkspace[\s\S]*guidance="guided"/);
    expect(account).toContain('progressItemId="capstone_guided_incident"');
    expect(pro).toMatch(/TroubleshootingProExperience/);
    expect(pro).toMatch(/Wireshark|RFC 9293|asymmetric/i);
  });

  it("ends the account capstone with three final knowledge checks", () => {
    const account = read("account");
    expect(account.match(/<KnowledgeCheck\s/g)).toHaveLength(3);
    expect(account).toContain('progressItemId="capstone_check_1"');
    expect(account).toContain('progressItemId="capstone_check_2"');
    expect(account).toContain('progressItemId="capstone_check_3"');
  });
});
