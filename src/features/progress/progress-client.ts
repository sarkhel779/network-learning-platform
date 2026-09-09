import type { ProgressMutationInput, RestartProgressInput } from "./progress-input.schema";
import type { LessonProgressSummary } from "./progress.types";

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class ProgressClientError extends Error {
  constructor(public readonly retryable: boolean) {
    super("Progress could not be saved.");
    this.name = "ProgressClientError";
  }
}

async function post(endpoint: string, input: ProgressMutationInput | RestartProgressInput, fetcher: Fetcher) {
  let response: Response;
  try {
    response = await fetcher(endpoint, {
      method: "POST", cache: "no-store",
      headers: { "content-type": "application/json" }, body: JSON.stringify(input),
    });
  } catch { throw new ProgressClientError(true); }
  if (!response.ok) throw new ProgressClientError(response.status >= 500 || response.status === 429);
  const result = await response.json() as { progress?: LessonProgressSummary };
  if (!result.progress) throw new ProgressClientError(false);
  return result.progress;
}

export function saveProgress(input: ProgressMutationInput, fetcher: Fetcher = fetch) {
  return post("/api/learning/progress", input, fetcher);
}

export function restartProgress(input: RestartProgressInput, fetcher: Fetcher = fetch) {
  return post("/api/learning/progress/restart", input, fetcher);
}
