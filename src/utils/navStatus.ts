// AIS Navigational Status codes (ITU-R M.1371)
const NAV_STATUS_LABELS: Record<number, string> = {
  0:  "Underway",
  1:  "At anchor",
  2:  "Not under command",
  3:  "Restricted manoeuvrability",
  4:  "Constrained by draught",
  5:  "Moored",
  6:  "Aground",
  7:  "Engaged in fishing",
  8:  "Underway sailing",
  15: "Unknown",
};

export function navStatusLabel(status: number | null): string | null {
  if (status === null) return null;
  return NAV_STATUS_LABELS[status] ?? null;
}
