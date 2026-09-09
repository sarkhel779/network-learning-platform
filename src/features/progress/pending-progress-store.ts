import { parseProgressMutationInput, type ProgressMutationInput } from "./progress-input.schema";

export type PendingProgressEvent = ProgressMutationInput & Readonly<{ createdAt: string }>;

const keyFor = (viewerId: string) => `packetsecrets:progress:${viewerId}`;

export function createPendingProgressStore(storage: Storage, viewerId: string, maximum = 50) {
  const key = keyFor(viewerId);
  const list = (): PendingProgressEvent[] => {
    try {
      const value: unknown = JSON.parse(storage.getItem(key) ?? "[]");
      if (!Array.isArray(value)) return [];
      return value.flatMap((candidate): PendingProgressEvent[] => {
        if (!candidate || typeof candidate !== "object" || !("createdAt" in candidate)
          || typeof candidate.createdAt !== "string") return [];
        try {
          const { createdAt, ...input } = candidate;
          return [{ ...parseProgressMutationInput(input), createdAt }];
        } catch { return []; }
      });
    } catch { return []; }
  };
  const write = (events: PendingProgressEvent[]) => storage.setItem(key, JSON.stringify(events.slice(-maximum)));
  return {
    list,
    clear() { storage.removeItem(key); },
    enqueue(event: PendingProgressEvent) {
      const events = list();
      if (!events.some(({ idempotencyKey }) => idempotencyKey === event.idempotencyKey)) events.push(event);
      write(events);
    },
    remove(idempotencyKey: string) {
      write(list().filter((event) => event.idempotencyKey !== idempotencyKey));
    },
  };
}
