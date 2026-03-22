const MIN_ALPHA = 0.3;
const MAX_ALPHA = 1.0;
const MAX_FREQ_HZ = 2.0;

export function shipPulseAlpha(speed: number, timeSeconds: number): number {
  const freq = Math.min(speed / 10, MAX_FREQ_HZ);
  if (freq <= 0) return MAX_ALPHA;
  const phase = Math.sin(2 * Math.PI * freq * timeSeconds);
  return MIN_ALPHA + (MAX_ALPHA - MIN_ALPHA) * (0.5 + 0.5 * phase);
}
