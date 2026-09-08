import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src/content/networking-foundations");
const publicLesson = readFileSync(join(root, "how-switches-learn-and-forward.public.mdx"), "utf8");
const accountLesson = readFileSync(join(root, "how-switches-learn-and-forward.account.mdx"), "utf8");

describe("How Switches Learn and Forward content", () => {
  it("keeps the public explanation in decision order and includes the interactive player", () => {
    const headings = [...publicLesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "the-switch-decision-cycle",
      "learn-the-source-address",
      "look-up-the-destination",
      "forward-filter-or-flood",
      "interactive-switch-learning",
    ]);
    expect(publicLesson).toContain("<SwitchLearningPlayer />");
    expect(publicLesson).toContain("receipt is not acceptance");
    expect(publicLesson).not.toContain("SWITCH_ACCOUNT_SENTINEL");
  });

  it("keeps exercises, evidence answers, and Pro depth in the account block", () => {
    expect(accountLesson).toContain("SWITCH_ACCOUNT_SENTINEL");
    expect(accountLesson).toContain("<FrameForwardingExperience");
    expect(accountLesson).toContain("showAdvancedShortcut");
    expect(accountLesson).toContain("Join the Pro Member Waitlist");
    expect(accountLesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(accountLesson.match(/<InterviewScenario\b/g)).toHaveLength(2);
  });
});
