import { HostIcon, RouterIcon } from "../hop-icons";
import type { HopScenarioData } from "../hop-lab-types";

export const permitDenyBasicsScenario: HopScenarioData = {
  topologyAriaLabel: "A host's packet falling through to an ACL's implicit deny",
  devices: [
    { id: "host", label: "Host", sublabel: "192.168.1.10", icon: <HostIcon /> },
    { id: "router", label: "Router", sublabel: "ACL 1", icon: <RouterIcon /> },
  ],
  steps: [
    {
      fromId: "host", toId: "router",
      title: "Packet from 192.168.1.10 arrives",
      explanation: "The router has one ACL applied, with a single explicit line: deny host 192.168.1.5. Nothing else is configured.",
      fields: [{ label: "Source", value: "192.168.1.10" }],
    },
    {
      fromId: "router", toId: null,
      title: "Router evaluates the ACL — and falls to the implicit deny",
      explanation: "The only explicit line denies 192.168.1.5 — this packet, from .10, doesn't match it. With no other explicit rule, it falls through to the implicit 'deny any' that every ACL ends with, even though it's never shown in the configuration.",
      fields: [{ label: "Matched rule", value: "(implicit) deny any" }],
      outcome: "blocked",
    },
  ],
  quiz: {
    question: "What's missing from this ACL to let all other traffic through, while still blocking 192.168.1.5?",
    options: [
      { id: "correct", label: "An explicit 'permit any' line after the deny line" },
      { id: "delete", label: "Deleting the ACL entirely" },
      { id: "temp", label: "Changing 'deny' to 'deny-temporarily'" },
      { id: "nothing", label: "Nothing — the implicit deny only applies to .5" },
    ],
    correctId: "correct",
    feedbackCorrect: "Correct. Since the implicit deny-all is unavoidable but applies last, adding an explicit 'permit any' after the specific deny restores access for everything except what you explicitly denied.",
    feedbackIncorrect: "Not quite. The implicit deny at the end of every ACL applies to anything not explicitly matched — the fix is adding an explicit permit rule, not changing the existing deny line.",
  },
};
