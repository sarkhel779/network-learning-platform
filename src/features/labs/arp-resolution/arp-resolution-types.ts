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
  requestFields: ArpFieldSpec[];
  replyFields: ArpReplyField[];
  cacheLearnedMessage: string;
};
