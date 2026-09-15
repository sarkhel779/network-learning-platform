export function IntegrationState({ area, reason }: { area: string; reason: string }) {
  return <section className="admin-panel admin-integration-state" role="status">
    <h2>{area} is not connected yet</h2>
    <p>{reason}</p>
  </section>;
}
