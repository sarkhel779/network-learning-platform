import type { AclSimConfig } from "./acl-simulator-types";

export const aclDirectionTroubleshootingSim: AclSimConfig = {
  title: "ACL direction simulator",
  canvasAriaLabel: "Host sending a test packet through a router whose ACL direction can be toggled",
  prompt: "This ACL is meant to block the host's outbound traffic on the LAN interface. Try both directions and see which one actually inspects it.",
  rules: [
    { id: "deny50", text: "10 deny host 192.168.1.50", action: "deny", matchIp: "192.168.1.50", reorderable: false, toggleable: false, enabledByDefault: true },
  ],
  sourceOptions: [
    { ip: "192.168.1.50", label: "192.168.1.50 (LAN host)" },
  ],
  directionToggle: { label: "ACL direction on the LAN interface (Gi0/1)", correctDirection: "in" },
};
