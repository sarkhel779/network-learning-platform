export type AclSimRule = {
  id: string;
  text: string;
  action: "permit" | "deny";
  matchIp: "any" | string;
  reorderable: boolean;
  toggleable: boolean;
  enabledByDefault: boolean;
};

export type AclSimSourceOption = { ip: string; label: string };

export type AclSimConfig = {
  title: string;
  canvasAriaLabel: string;
  rules: AclSimRule[];
  sourceOptions: AclSimSourceOption[];
  directionToggle?: { label: string; correctDirection: "in" | "out" };
  prompt: string;
};
