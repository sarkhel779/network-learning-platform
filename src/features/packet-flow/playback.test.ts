import { describe, expect, it } from "vitest";
import { PLAYBACK_SPEEDS } from "./packet-flow.schema";
import {
  createPlaybackState,
  getStepDelay,
  playbackReducer,
  type PlaybackState,
  type PlaybackSpeed,
} from "./playback";

describe("packet flow playback", () => {
  it("initializes at step zero and respects reduced motion", () => {
    expect(createPlaybackState(11, 1, false)).toEqual({
      stepIndex: 0,
      stepCount: 11,
      speed: 1,
      playing: true,
    });
    expect(createPlaybackState(11, 1, true).playing).toBe(false);
  });

  it("pauses and resumes playback", () => {
    const playing = createPlaybackState(3, 1, false);
    const paused = playbackReducer(playing, { type: "pause" });
    expect(paused.playing).toBe(false);
    expect(playbackReducer(paused, { type: "play" }).playing).toBe(true);
  });

  it("advances and pauses at the final step", () => {
    const playing = createPlaybackState(3, 1, false);
    expect(playbackReducer(playing, { type: "next" })).toMatchObject({ stepIndex: 1, playing: false });
    expect(playbackReducer({ ...playing, stepIndex: 2 }, { type: "tick" })).toMatchObject({ stepIndex: 2, playing: false });
  });

  it("clamps manual navigation and always pauses", () => {
    const state = createPlaybackState(3, 1, false);
    expect(playbackReducer(state, { type: "previous" })).toMatchObject({ stepIndex: 0, playing: false });
    expect(playbackReducer({ ...state, stepIndex: 2 }, { type: "next" })).toMatchObject({ stepIndex: 2, playing: false });
  });

  it("moves directly to a selected step and pauses playback", () => {
    const state = createPlaybackState(5, 1, false);

    expect(playbackReducer(state, { type: "go-to", stepIndex: 4 })).toMatchObject({ stepIndex: 4, playing: false });
    expect(playbackReducer(state, { type: "go-to", stepIndex: -1 })).toMatchObject({ stepIndex: 0, playing: false });
    expect(playbackReducer(state, { type: "go-to", stepIndex: 99 })).toMatchObject({ stepIndex: 4, playing: false });
  });

  it("does not advance a paused tick and does not play at the end", () => {
    const paused = createPlaybackState(3, 1, true);
    expect(playbackReducer(paused, { type: "tick" })).toEqual(paused);
    const atEnd = { ...paused, stepIndex: 2 };
    expect(playbackReducer(atEnd, { type: "play" })).toEqual(atEnd);
  });

  it("restarts with the requested autoplay value", () => {
    const atEnd = { ...createPlaybackState(3, 1, false), stepIndex: 2 };
    expect(playbackReducer(atEnd, { type: "restart", autoplay: true })).toMatchObject({ stepIndex: 0, playing: true });
    expect(playbackReducer(atEnd, { type: "restart", autoplay: false })).toMatchObject({ stepIndex: 0, playing: false });
  });

  it("changes speed and ignores unsupported runtime speeds", () => {
    const state = createPlaybackState(3, 1, false);
    expect(playbackReducer(state, { type: "set-speed", speed: 2 })).toMatchObject({ speed: 2 });
    expect(playbackReducer(state, { type: "set-speed", speed: 3 as never })).toBe(state);
  });

  it("calculates delay for supported speeds", () => {
    expect(getStepDelay(1800, 2)).toBe(900);
    expect(PLAYBACK_SPEEDS).toEqual([0.5, 1, 1.5, 2]);
  });

  it.each([
    [0, 1],
    [-1, 1],
    [1.5, 1],
  ])("rejects invalid step count %s", (stepCount, speed) => {
    expect(() => createPlaybackState(stepCount, speed as PlaybackSpeed, false)).toThrow();
  });

  it("rejects unsupported initialization speed", () => {
    expect(() => createPlaybackState(1, 3 as never, false)).toThrow();
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])("rejects invalid duration %s", (duration) => {
    expect(() => getStepDelay(duration, 1)).toThrow();
  });

  it("rejects unsupported delay speed", () => {
    expect(() => getStepDelay(1000, 3 as never)).toThrow();
  });
});

export type { PlaybackState };
