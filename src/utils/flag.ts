// MID (first 3 digits of MMSI) → ISO 3166-1 alpha-2 country code
// Only MIDs realistically seen on the Elbe are listed; others fall back to null.
const MID_TO_CC: Record<number, string> = {
  211: "DE", 218: "DE",              // Germany
  244: "NL", 245: "NL", 246: "NL",   // Netherlands
  205: "BE", 206: "BE",              // Belgium
  232: "GB", 233: "GB", 234: "GB", 235: "GB", // UK
  230: "FI",                         // Finland
  265: "SE", 266: "SE",              // Sweden
  219: "DK", 220: "DK",             // Denmark
  209: "CY",                         // Cyprus
  255: "PT",                         // Portugal (Madeira)
  248: "MT",                         // Malta
  229: "MT",                         // Malta
  308: "BS",                         // Bahamas (common for large cargo)
  370: "PA",                         // Panama
  374: "PA",                         // Panama
  256: "MA",                         // Morocco
  338: "US",                         // USA
  636: "LR",                         // Liberia
  657: "MZ",                         // Mozambique
  667: "SL",                         // Sierra Leone
  677: "CM",                         // Cameroon
  306: "AN",                         // Netherlands Antilles
  319: "KY",                         // Cayman Islands
  378: "VG",                         // British Virgin Islands
  416: "TW",                         // Taiwan
  477: "HK",                         // Hong Kong
  441: "KR",                         // South Korea
  431: "JP", 432: "JP",             // Japan
  518: "CK",                         // Cook Islands
  538: "MH",                         // Marshall Islands
  572: "TV",                         // Tuvalu
};

function ccToFlag(cc: string): string {
  // Convert ISO country code to emoji flag
  return cc
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

export function flagFromMmsi(mmsi: number): string | null {
  const mid = Math.floor(mmsi / 1_000_000);
  const cc = MID_TO_CC[mid];
  return cc ? ccToFlag(cc) : null;
}
