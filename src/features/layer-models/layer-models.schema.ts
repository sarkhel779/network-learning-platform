import { z } from "zod";

const osiLayerSchema = z.object({
  number: z.number().int(),
  name: z.string().min(1),
  summary: z.string().min(1),
  examples: z.array(z.string().min(1)).min(1),
});

const tcpIpLayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  examples: z.array(z.string().min(1)).min(1),
});

const mappingEntrySchema = z.object({
  tcpIpLayer: z.string().min(1),
  osiLayers: z.array(z.number().int()).min(1),
  explanation: z.string().min(1),
});

const encapsulationStepSchema = z.object({
  id: z.string().min(1),
  direction: z.enum(["encapsulation", "transmission", "decapsulation"]),
  title: z.string().min(1),
  plainExplanation: z.string().min(1),
  technicalExplanation: z.string().min(1),
  activeOsiLayer: z.number().int(),
  activeTcpIpLayer: z.string().min(1),
  pdu: z.enum(["Data", "Segment", "Packet", "Frame", "Bits"]),
  addedInformation: z.string().min(1),
  durationMs: z.number().positive({ message: "Duration must be greater than 0." }),
});

const deviceScopeSchema = z.object({
  id: z.enum(["host", "switch", "router", "firewall"]),
  name: z.string().min(1),
  commonlyExamines: z.string().min(1),
  osiLayers: z.array(z.number().int()).min(1),
  tcpIpLayers: z.array(z.string().min(1)).min(1),
  explanation: z.string().min(1),
});

const deviceLayerScopesSchema = z.array(deviceScopeSchema).min(1);

const EXPECTED_OSI_LAYERS = [7, 6, 5, 4, 3, 2, 1] as const;
const EXPECTED_TCP_IP_LAYERS = ["application", "transport", "internet", "network-access"] as const;

const layerModelsLabSchema = z.object({
  osiLayers: z.array(osiLayerSchema),
  tcpIpLayers: z.array(tcpIpLayerSchema),
  mapping: z.array(mappingEntrySchema),
  encapsulationSteps: z.array(encapsulationStepSchema).min(1),
}).strict().superRefine((lab, context) => {
  const osiNumbers = lab.osiLayers.map(({ number }) => number);
  if (osiNumbers.length !== EXPECTED_OSI_LAYERS.length ||
      osiNumbers.some((number, index) => number !== EXPECTED_OSI_LAYERS[index])) {
    context.addIssue({
      code: "custom",
      path: ["osiLayers"],
      message: "OSI layers must be unique and ordered exactly 7, 6, 5, 4, 3, 2, 1.",
    });
  }

  const tcpIpIds = lab.tcpIpLayers.map(({ id }) => id);
  if (tcpIpIds.length !== EXPECTED_TCP_IP_LAYERS.length ||
      tcpIpIds.some((id, index) => id !== EXPECTED_TCP_IP_LAYERS[index])) {
    context.addIssue({
      code: "custom",
      path: ["tcpIpLayers"],
      message: "TCP/IP layers must be exactly application, transport, internet, and network-access.",
    });
  }

  const tcpIpIdSet = new Set(tcpIpIds);
  const coverage = new Map<number, number>();
  for (const entry of lab.mapping) {
    if (!tcpIpIdSet.has(entry.tcpIpLayer)) {
      context.addIssue({ code: "custom", path: ["mapping"], message: `Unknown TCP/IP layer reference: ${entry.tcpIpLayer}.` });
    }
    for (const number of entry.osiLayers) {
      coverage.set(number, (coverage.get(number) ?? 0) + 1);
    }
  }

  if (EXPECTED_OSI_LAYERS.some((number) => !coverage.has(number))) {
    context.addIssue({
      code: "custom",
      path: ["mapping"],
      message: "OSI-to-TCP/IP mapping coverage must include every OSI layer.",
    });
  }
  if ([...coverage.entries()].some(([number, count]) => !EXPECTED_OSI_LAYERS.includes(number as never) || count !== 1)) {
    context.addIssue({
      code: "custom",
      path: ["mapping"],
      message: "Every OSI layer must occur in exactly one mapping entry.",
    });
  }

  const mappingCounts = new Map<string, number>();
  for (const entry of lab.mapping) {
    mappingCounts.set(entry.tcpIpLayer, (mappingCounts.get(entry.tcpIpLayer) ?? 0) + 1);
  }
  if (
    EXPECTED_TCP_IP_LAYERS.some((id) => mappingCounts.get(id) !== 1)
    || [...mappingCounts.keys()].some((id) => !EXPECTED_TCP_IP_LAYERS.includes(id as never))
    || lab.mapping.length !== EXPECTED_TCP_IP_LAYERS.length
  ) {
    context.addIssue({
      code: "custom",
      path: ["mapping"],
      message: "Every canonical TCP/IP layer must have exactly one mapping entry.",
    });
  }

  for (const [index, step] of lab.encapsulationSteps.entries()) {
    if (!osiNumbers.includes(step.activeOsiLayer)) {
      context.addIssue({ code: "custom", path: ["encapsulationSteps", index, "activeOsiLayer"], message: `Invalid OSI layer reference: ${step.activeOsiLayer}.` });
    }
    if (!tcpIpIdSet.has(step.activeTcpIpLayer)) {
      context.addIssue({ code: "custom", path: ["encapsulationSteps", index, "activeTcpIpLayer"], message: `Invalid TCP/IP layer reference: ${step.activeTcpIpLayer}.` });
    }
  }
});

export type LayerModelsLab = z.infer<typeof layerModelsLabSchema>;
export type DeviceLayerScopes = z.infer<typeof deviceLayerScopesSchema>;

type LayerReferenceCatalog = Readonly<{
  osiLayers: ReadonlyArray<Readonly<{ number: number }>>;
  tcpIpLayers: ReadonlyArray<Readonly<{ id: string }>>;
}>;

export function parseLayerModelsLab(input: unknown): LayerModelsLab {
  return layerModelsLabSchema.parse(input);
}

export function parseDeviceLayerScopes(
  input: unknown,
  lab: LayerReferenceCatalog,
): DeviceLayerScopes {
  const osiNumbers = new Set(lab.osiLayers.map(({ number }) => number));
  const tcpIpIds = new Set(lab.tcpIpLayers.map(({ id }) => id));

  return deviceLayerScopesSchema.superRefine((scopes, context) => {
    for (const [index, scope] of scopes.entries()) {
      if (scope.osiLayers.some((number) => !osiNumbers.has(number))) {
        context.addIssue({
          code: "custom",
          path: [index, "osiLayers"],
          message: "Device scope has an invalid OSI layer reference.",
        });
      }
      if (scope.tcpIpLayers.some((id) => !tcpIpIds.has(id))) {
        context.addIssue({
          code: "custom",
          path: [index, "tcpIpLayers"],
          message: "Device scope has an invalid TCP/IP layer reference.",
        });
      }
    }
  }).parse(input);
}
