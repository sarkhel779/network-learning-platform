import { PLAYBACK_SPEEDS } from "@/features/packet-flow/packet-flow.schema";

export type TransportPlayerControlsProps = {
  stepIndex: number;
  finalIndex: number;
  playing: boolean;
  speed: number;
  onPrevious(): void;
  onTogglePlay(): void;
  onNext(): void;
  onRestart(): void;
  onSpeedChange(speed: number): void;
};

export function TransportPlayerControls(props: TransportPlayerControlsProps) {
  return <div className="player-controls transport-player-controls">
    <button disabled={props.stepIndex === 0} onClick={props.onPrevious}>Previous</button>
    <button disabled={props.stepIndex === props.finalIndex} onClick={props.onTogglePlay}>{props.playing ? "Pause" : "Play"}</button>
    <button disabled={props.stepIndex === props.finalIndex} onClick={props.onNext}>Next</button>
    <button onClick={props.onRestart}>Restart</button>
    <label>Playback speed <select aria-label="Playback speed" onChange={(event) => props.onSpeedChange(Number(event.target.value))} value={props.speed}>
      {PLAYBACK_SPEEDS.map((value) => <option key={value} value={value}>{value}×</option>)}
    </select></label>
  </div>;
}
