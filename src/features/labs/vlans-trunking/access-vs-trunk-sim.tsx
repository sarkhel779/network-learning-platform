import { HostIcon, SwitchIcon } from "../hop-icons";
import type { LinkTypeSimConfig } from "./link-type-simulator-types";

export const accessVsTrunkSim: LinkTypeSimConfig = {
  title: "Access vs. trunk port simulator",
  canvasAriaLabel: "A frame traveling from a host through two switches to another host",
  prompt: "Configure the link between the switches, pick which VLAN's frame to send, then test it. Only a trunk can carry more than one VLAN.",
  sourceLabel: "Host",
  sourceIcon: <HostIcon />,
  destLabel: "Host",
  destIcon: <HostIcon />,
  middleLabelA: "Switch A",
  middleIconA: <SwitchIcon />,
  middleLabelB: "Switch B",
  middleIconB: <SwitchIcon />,
  configurableLinkFieldLabel: "Switch A ↔ Switch B link",
  linkOptions: [
    { value: "access10", label: "Access port (VLAN 10 only)", vlan: "10" },
    { value: "access20", label: "Access port (VLAN 20 only)", vlan: "20" },
    { value: "trunk", label: "Trunk (802.1Q, carries every VLAN)" },
  ],
  defaultLinkType: "access20",
  testOptions: [
    { value: "10", label: "VLAN 10 frame" },
    { value: "20", label: "VLAN 20 frame" },
  ],
  defaultTestValue: "10",
};
