import type { AclSimConfig } from "./acl-simulator-types";

export const permitDenyBasicsSim: AclSimConfig = {
  title: "ACL implicit deny simulator",
  canvasAriaLabel: "Host sending a test packet through a router with an ACL toward a destination",
  prompt: "Send from each source with 'permit any' off, then turn it on and retest. Watch how the implicit deny at the end of every ACL affects traffic that no explicit rule covers.",
  rules: [
    { id: "deny5", text: "10 deny host 192.168.1.5", action: "deny", matchIp: "192.168.1.5", reorderable: false, toggleable: false, enabledByDefault: true },
    { id: "permitany", text: "20 permit any", action: "permit", matchIp: "any", reorderable: false, toggleable: true, enabledByDefault: false },
  ],
  sourceOptions: [
    { ip: "192.168.1.5", label: "192.168.1.5 (explicitly denied)" },
    { ip: "192.168.1.10", label: "192.168.1.10 (everyone else)" },
  ],
};
