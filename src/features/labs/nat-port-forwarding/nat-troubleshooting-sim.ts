import type { AclSimConfig } from "../access-control-lists/acl-simulator-types";

export const natTroubleshootingSim: AclSimConfig = {
  title: "NAT troubleshooting simulator",
  canvasAriaLabel: "Host sending a test packet through a NAT router toward the internet",
  prompt: "This router's NAT overload rule only translates traffic its ACL permits. Test as written, then disable the line that's excluding this subnet.",
  rulesLegend: "NAT access list, in evaluation order",
  routerSublabel: "PAT / overload",
  destinationLabel: "Internet",
  rules: [
    { id: "deny24", text: "access-list 1 deny 192.168.1.0 0.0.0.255", action: "deny", matchIp: "192.168.1.50", reorderable: false, toggleable: true, enabledByDefault: true },
    { id: "permitany", text: "access-list 1 permit any", action: "permit", matchIp: "any", reorderable: false, toggleable: false, enabledByDefault: true },
  ],
  sourceOptions: [
    { ip: "192.168.1.50", label: "192.168.1.50 (on the excluded subnet)" },
  ],
};
