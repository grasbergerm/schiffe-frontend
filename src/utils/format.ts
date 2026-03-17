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

// Blankenese longitude reference point
const BLANKENESE_LON = 9.8063;

export function getDirection(heading: number, lon: number): string {
  if (heading === 511) {
    // Infer from position: west of Blankenese = inbound (heading east)
    return lon < BLANKENESE_LON ? "Inbound →" : "Outbound ←";
  }
  if (heading >= 30 && heading <= 150) return "Inbound →";
  if (heading >= 210 && heading <= 330) return "Outbound ←";
  // Fallback: compass bearing
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(heading / 45) % 8];
}
