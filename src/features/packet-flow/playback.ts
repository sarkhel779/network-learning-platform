import { PLAYBACK_SPEEDS } from "./packet-flow.schema";

export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

export type PlaybackState = Readonly<{
  stepIndex: number;
  stepCount: number;
  speed: PlaybackSpeed;
  playing: boolean;
}>;

export type PlaybackAction =
  | { type: "play" }
  | { type: "pause" }
  | { type: "tick" }
  | { type: "next" }
  | { type: "previous" }
  | { type: "go-to"; stepIndex: number }
  | { type: "restart"; autoplay: boolean }
  | { type: "set-speed"; speed: PlaybackSpeed };

function isPlaybackSpeed(value: unknown): value is PlaybackSpeed {
  return (PLAYBACK_SPEEDS as readonly number[]).includes(value as number);
}

export function createPlaybackState(
  stepCount: number,
  defaultSpeed: PlaybackSpeed,
  reducedMotion: boolean,
): PlaybackState {
  if (!Number.isInteger(stepCount) || stepCount <= 0) {
    throw new RangeError("stepCount must be a positive integer");
  }
  if (!isPlaybackSpeed(defaultSpeed)) {
    throw new RangeError("unsupported playback speed");
  }
  return { stepIndex: 0, stepCount, speed: defaultSpeed, playing: !reducedMotion };
}

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case "play":
      return state.stepIndex === state.stepCount - 1 ? state : { ...state, playing: true };
    case "pause":
      return state.playing ? { ...state, playing: false } : state;
    case "tick":
      if (!state.playing) return state;
      if (state.stepIndex === state.stepCount - 1) return { ...state, playing: false };
      {
        const stepIndex = state.stepIndex + 1;
        return { ...state, stepIndex, playing: stepIndex < state.stepCount - 1 };
      }
    case "next":
      return { ...state, stepIndex: Math.min(state.stepCount - 1, state.stepIndex + 1), playing: false };
    case "previous":
      return { ...state, stepIndex: Math.max(0, state.stepIndex - 1), playing: false };
    case "go-to":
      return {
        ...state,
        stepIndex: Math.min(state.stepCount - 1, Math.max(0, action.stepIndex)),
        playing: false,
      };
    case "restart":
      return { ...state, stepIndex: 0, playing: action.autoplay };
    case "set-speed":
      return isPlaybackSpeed(action.speed) ? { ...state, speed: action.speed } : state;
  }
}

export function getStepDelay(durationMs: number, speed: PlaybackSpeed): number {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new RangeError("durationMs must be finite and positive");
  }
  if (!isPlaybackSpeed(speed)) {
    throw new RangeError("unsupported playback speed");
  }
  return durationMs / speed;
}
