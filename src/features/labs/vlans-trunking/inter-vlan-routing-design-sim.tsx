import { HostIcon, RouterIcon, SwitchIcon } from "../hop-icons";
import type { LinkTypeSimConfig } from "./link-type-simulator-types";

export const interVlanRoutingDesignSim: LinkTypeSimConfig = {
  title: "Inter-VLAN routing design simulator",
  canvasAriaLabel: "A host in VLAN 10 reaching a host in VLAN 20 through a router-on-a-stick",
  prompt: "This is router-on-a-stick: VLAN 10 and VLAN 20 both reach the router over the same switch-to-router link. Configure that link, then test VLAN 10 reaching VLAN 20.",
  sourceLabel: "Host A (VLAN 10)",
  sourceIcon: <HostIcon />,
  destLabel: "Host B (VLAN 20)",
  destIcon: <HostIcon />,
  middleLabelA: "Switch",
  middleIconA: <SwitchIcon />,
  middleLabelB: "Router-on-a-stick",
  middleIconB: <RouterIcon />,
  configurableLinkFieldLabel: "Switch ↔ Router link",
  linkOptions: [
    { value: "access10", label: "Access port (VLAN 10 only)", vlan: "10" },
    { value: "access20", label: "Access port (VLAN 20 only)", vlan: "20" },
    { value: "trunk", label: "Trunk (802.1Q, carries both VLANs)" },
  ],
  defaultLinkType: "access10",
};
