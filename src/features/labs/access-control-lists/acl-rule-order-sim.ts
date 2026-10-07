import type { AclSimConfig } from "./acl-simulator-types";

export const aclRuleOrderSim: AclSimConfig = {
  title: "ACL rule order simulator",
  canvasAriaLabel: "Host sending a test packet through a router with a reorderable ACL toward a destination",
  prompt: "This ACL was meant to block 192.168.1.50. Test it as written, then reorder the rules so the deny actually takes effect.",
  rules: [
    { id: "permitany", text: "10 permit any", action: "permit", matchIp: "any", reorderable: true, toggleable: false, enabledByDefault: true },
    { id: "deny50", text: "20 deny host 192.168.1.50", action: "deny", matchIp: "192.168.1.50", reorderable: true, toggleable: false, enabledByDefault: true },
  ],
  sourceOptions: [
    { ip: "192.168.1.50", label: "192.168.1.50 (should be blocked)" },
    { ip: "192.168.1.60", label: "192.168.1.60 (everyone else)" },
  ],
};
