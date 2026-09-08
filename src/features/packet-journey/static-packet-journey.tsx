import type { PacketJourney } from "./packet-journey.types";

export function StaticPacketJourney({ journey }: { journey: PacketJourney }) {
  return (
    <section className="static-packet-journey">
      <h3>Packet journey: step by step</h3>
      <ol>
        {journey.stages.map((stage) => (
          <li key={stage.id}>
            <strong>{stage.title}</strong>
            <p>{stage.explanation}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
