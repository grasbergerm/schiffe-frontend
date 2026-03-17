export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function formatSpeed(knots: number): string {
  return `${knots.toFixed(1)} kn`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export function formatNow(): string {
  return new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export function getDirection(heading: number): string {
  if (heading === 511) return "—";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(heading / 45) % 8];
}
