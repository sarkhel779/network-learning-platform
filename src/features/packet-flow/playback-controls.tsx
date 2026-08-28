import type { Dispatch } from "react";

import { PLAYBACK_SPEEDS } from "./packet-flow.schema";
import type { PlaybackAction, PlaybackSpeed, PlaybackState } from "./playback";

type PlaybackControlsProps = Readonly<{
  state: PlaybackState;
  dispatch: Dispatch<PlaybackAction>;
  reducedMotion: boolean;
}>;

function speedLabel(speed: PlaybackSpeed): string {
  return `${speed}×`;
}

export function PlaybackControls({ state, dispatch, reducedMotion }: PlaybackControlsProps) {
  const atFinalStep = state.stepIndex === state.stepCount - 1;

  return (
    <div className="packet-flow-controls" data-reduced-motion={reducedMotion ? "true" : undefined}>
      <button type="button" onClick={() => dispatch({ type: "previous" })} disabled={state.stepIndex === 0}>
        Previous
      </button>
      <button type="button" onClick={() => dispatch({ type: state.playing ? "pause" : "play" })} disabled={atFinalStep}>
        {state.playing ? "Pause" : "Play"}
      </button>
      <button type="button" onClick={() => dispatch({ type: "next" })} disabled={atFinalStep}>
        Next
      </button>
      <button type="button" onClick={() => dispatch({ type: "restart", autoplay: !reducedMotion })}>
        Restart
      </button>
      <label>
        Playback speed
        <select
          value={state.speed}
          onChange={(event) => dispatch({ type: "set-speed", speed: Number(event.currentTarget.value) as PlaybackSpeed })}
        >
          {PLAYBACK_SPEEDS.map((speed) => <option key={speed} value={speed}>{speedLabel(speed)}</option>)}
        </select>
      </label>
    </div>
  );
}
