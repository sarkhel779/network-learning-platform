import type { ReactNode } from "react";

export type LinkTypeOption = { value: string; label: string; vlan?: string };
export type LinkTypeTestOption = { value: string; label: string };

export type LinkTypeSimConfig = {
  title: string;
  canvasAriaLabel: string;
  prompt: string;
  sourceLabel: string;
  sourceIcon: ReactNode;
  destLabel: string;
  destIcon: ReactNode;
  middleLabelA: string;
  middleIconA: ReactNode;
  middleLabelB: string;
  middleIconB: ReactNode;
  configurableLinkFieldLabel: string;
  linkOptions: LinkTypeOption[];
  defaultLinkType: string;
  testOptions?: LinkTypeTestOption[];
  defaultTestValue?: string;
};
