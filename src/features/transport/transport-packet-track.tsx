export function TransportPacketTrack({ stepId, direction }: { stepId: string; direction: "forward" | "reverse" | "none" }) {
  return <span className="transport-packet-track" data-direction={direction} aria-label={direction === "none" ? "No packet crossing" : `Packet moving ${direction === "forward" ? "toward receiver" : "toward sender"}`}>
    {direction !== "none" ? <span key={stepId} className="transport-packet-track__packet" data-packet-envelope="true" aria-hidden="true">✉</span> : null}
  </span>;
}
