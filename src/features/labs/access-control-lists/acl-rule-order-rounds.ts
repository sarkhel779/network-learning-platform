import type { ChallengeRound } from "../challenge-rounds";

export const aclRuleOrderRounds: ChallengeRound[] = [
  {
    prompt: "An ACL is written as:\n1. permit any\n2. deny host 192.168.1.50\n\nDoes this ACL ever block 192.168.1.50's traffic?",
    options: [
      { id: "correct", label: "No — line 1 ('permit any') matches every packet, including from .50, before line 2 is ever reached" },
      { id: "denywins", label: "Yes, because deny rules always take priority over permit rules" },
      { id: "udponly", label: "Yes, but only for UDP traffic" },
      { id: "noneallowed", label: "No traffic is permitted at all because the rules conflict" },
    ],
    correctId: "correct",
    explanation: "Since ACL lines are checked top-down and the first match wins, 'permit any' on line 1 matches absolutely everything — including .50's traffic — before the more specific deny line is ever evaluated. Line 2 becomes permanently unreachable, dead configuration.",
  },
  {
    prompt: "To correctly block only 192.168.1.50 while permitting everyone else, how should the two lines above be ordered?",
    options: [
      { id: "correct", label: "Put 'deny host 192.168.1.50' first, then 'permit any' second" },
      { id: "same", label: "The original order is already correct" },
      { id: "bothdeny", label: "Both lines need to say 'deny'" },
      { id: "noeffect", label: "Order doesn't matter in ACLs" },
    ],
    correctId: "correct",
    explanation: "More specific rules must come before more general ones. Placing the specific deny first ensures .50's traffic is matched and blocked before the general 'permit any' rule has a chance to allow it through.",
  },
  {
    prompt: "Why do experienced network engineers generally order ACL entries from most specific to least specific?",
    options: [
      { id: "correct", label: "Because the first matching line wins, so a general rule placed early can silently shadow every more specific rule that follows it" },
      { id: "speed", label: "Because routers process specific rules faster than general ones" },
      { id: "alpha", label: "Because ACLs alphabetize their rules automatically" },
      { id: "cosmetic", label: "It's only a stylistic convention with no functional effect" },
    ],
    correctId: "correct",
    explanation: "This ordering isn't cosmetic — given first-match-wins evaluation, a broad rule placed too early will catch traffic that a later, more specific rule was meant to handle, making that later rule unreachable. Specific-before-general avoids that trap.",
  },
];
