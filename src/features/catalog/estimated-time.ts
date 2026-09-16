export function formatEstimatedTime(minutes: number): string {
  const lower = Math.max(5, Math.floor((minutes - 2.5) / 5) * 5);
  const upper = Math.max(lower + 5, Math.ceil((minutes + 2.5) / 5) * 5);
  return `Estimated time: ${lower}–${upper} min`;
}
