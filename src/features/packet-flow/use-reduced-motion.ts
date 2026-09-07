import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export type ReducedMotionState = Readonly<{
  reducedMotion: boolean;
  isHydrated: boolean;
}>;

const SERVER_SNAPSHOT: ReducedMotionState = Object.freeze({
  reducedMotion: true,
  isHydrated: false,
});
let clientSnapshot: ReducedMotionState | undefined;

function getMediaQueryList(): MediaQueryList | undefined {
  return typeof window === "undefined" ? undefined : window.matchMedia(QUERY);
}

function subscribe(listener: () => void): () => void {
  const mediaQueryList = getMediaQueryList();
  if (!mediaQueryList) return () => undefined;
  mediaQueryList.addEventListener("change", listener);
  return () => mediaQueryList.removeEventListener("change", listener);
}

function getSnapshot(): ReducedMotionState {
  const reducedMotion = getMediaQueryList()?.matches ?? false;
  if (!clientSnapshot || clientSnapshot.reducedMotion !== reducedMotion) {
    clientSnapshot = { reducedMotion, isHydrated: true };
  }
  return clientSnapshot;
}

// A safe paused snapshot is used for both server rendering and the first
// hydration render. The client preference and readiness resolve atomically,
// so reduced-motion users never see an autoplaying first frame.
function getServerSnapshot(): ReducedMotionState {
  return SERVER_SNAPSHOT;
}

export function useReducedMotionState(): ReducedMotionState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useReducedMotion(): boolean {
  return useReducedMotionState().reducedMotion;
}
