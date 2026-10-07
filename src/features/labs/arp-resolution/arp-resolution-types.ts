export type ArpFieldKey = "etherDest" | "senderMac" | "senderIp" | "targetMac" | "targetIp" | "opcode";

export type ArpFieldOption = { value: string; label: string };

export type ArpFieldSpec = {
  key: ArpFieldKey;
  label: string;
  correctValue: string;
  options: ArpFieldOption[];
};

export type ArpReplyField = { label: string; value: string };

export type AndStepOption = { value: string; label: string };

export type ArpGateway = { label: string; ip: string; mac: string };

export type ArpDecisionOption = { value: string; label: string };

export type ArpDecisionStep = {
  prompt: string;
  options: ArpDecisionOption[];
  correctValue: string;
  dropExplanation: string;
  dropAtNodeId: "host" | "switch" | "destination";
  proceedExplanation: string;
};

export type ArpResolutionConfig = {
  title: string;
  canvasAriaLabel: string;
  hostLabel: string;
  hostIp: string;
  hostMac: string;
  destinationLabel: string;
  destinationIp: string;
  destinationMac: string;
  subnetMask: string;
  intro: string;
  andQuestion: string;
  andOptions: AndStepOption[];
  andCorrectValue: string;
  nextHopConclusion: string;
  /** When set, the third canvas node and the ARP request/reply target this gateway instead of the destination directly. */
  gateway?: ArpGateway;
  /** When set, shown after the AND reveal and before the request step; a wrong pick animates a drop instead of advancing. */
  decisionStep?: ArpDecisionStep;
  requestIntro?: string;
  /** Pre-filled draft values for specific fields, overriding the generic "classic mistake" defaults. */
  draftOverrides?: Partial<Record<ArpFieldKey, string>>;
  requestFields: ArpFieldSpec[];
  replyFields: ArpReplyField[];
  cacheLearnedMessage: string;
};
