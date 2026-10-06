import type { ChallengeRound } from "../challenge-rounds";

export const permitDenyBasicsRounds: ChallengeRound[] = [
  {
    prompt: "An ACL has a single line: 'deny 192.168.1.5'. There is no other line. A packet arrives from 192.168.1.10. What happens?",
    options: [
      { id: "correct", label: "It is denied, because every ACL ends with an implicit 'deny any' after the last explicit line" },
      { id: "permitted", label: "It is permitted, because the deny line only applies to .5" },
      { id: "crash", label: "The router crashes because the ACL is incomplete" },
      { id: "defaultallow", label: "It is permitted because ACLs default to allowing everything not explicitly denied" },
    ],
    correctId: "correct",
    explanation: "Every ACL has an implicit 'deny all' at the very end, even though it's never shown in the configuration. Since .10 doesn't match the one explicit line (which only denies .5) and there's no explicit permit, it falls through to that implicit deny.",
  },
  {
    prompt: "What's the fix to make the ACL above deny only 192.168.1.5 while still allowing all other traffic?",
    options: [
      { id: "correct", label: "Add a second line: 'permit any' after the deny line" },
      { id: "remove", label: "Delete the ACL and don't use one" },
      { id: "temp", label: "Change 'deny' to 'deny-temporarily'" },
      { id: "nothing", label: "Nothing — the implicit deny only applies to .5" },
    ],
    correctId: "correct",
    explanation: "Since the implicit deny-all is unavoidable but applies last, adding an explicit 'permit any' after your specific deny rule restores access for everything except what you explicitly denied.",
  },
  {
    prompt: "ACLs are evaluated:",
    options: [
      { id: "correct", label: "Top to bottom, stopping at the first line that matches the packet" },
      { id: "bottomup", label: "Bottom to top, stopping at the first match" },
      { id: "allatonce", label: "All lines simultaneously, with the most specific one always winning regardless of order" },
      { id: "random", label: "In random order for load balancing" },
    ],
    correctId: "correct",
    explanation: "Router ACLs process entries sequentially from the top. The first matching line's action (permit or deny) is applied immediately, and no further lines are checked — which is why rule order matters so much.",
  },
];
