// MID (first 3 digits of MMSI) → ISO 3166-1 alpha-2 country code
const MID_TO_CC: Record<number, string> = {
  // Europe
  211: "DE", 218: "DE",                          // Germany
  244: "NL", 245: "NL", 246: "NL",               // Netherlands
  205: "BE", 206: "BE",                           // Belgium
  232: "GB", 233: "GB", 234: "GB", 235: "GB",    // UK
  230: "FI",                                      // Finland
  265: "SE", 266: "SE",                           // Sweden
  219: "DK", 220: "DK",                           // Denmark
  209: "CY",                                      // Cyprus
  255: "PT",                                      // Portugal (Madeira)
  248: "MT", 229: "MT", 256: "MT",                // Malta (256 was wrongly MA)
  226: "FR", 227: "FR", 228: "FR",                // France
  247: "IT",                                      // Italy
  224: "ES", 225: "ES",                           // Spain
  257: "NO", 258: "NO", 259: "NO",                // Norway
  237: "GR", 239: "GR", 240: "GR", 241: "GR",    // Greece
  250: "IE", 251: "IE",                           // Ireland
  252: "IS",                                      // Iceland
  261: "PL",                                      // Poland
  276: "EE",                                      // Estonia
  275: "LV",                                      // Latvia
  277: "LT",                                      // Lithuania
  238: "HR",                                      // Croatia
  264: "RO",                                      // Romania
  207: "BG",                                      // Bulgaria
  272: "UA",                                      // Ukraine
  271: "TR",                                      // Turkey
  273: "RU",                                      // Russia
  236: "GI",                                      // Gibraltar
  231: "FO",                                      // Faroe Islands
  242: "MA",                                      // Morocco
  // Americas
  338: "US",                                      // USA
  316: "CA",                                      // Canada
  345: "MX",                                      // Mexico
  710: "BR", 735: "BR",                           // Brazil
  720: "AR",                                      // Argentina
  725: "CL",                                      // Chile
  730: "CO",                                      // Colombia
  760: "PE",                                      // Peru
  775: "VE",                                      // Venezuela
  308: "BS",                                      // Bahamas
  310: "BM",                                      // Bermuda
  312: "BZ",                                      // Belize
  304: "AG", 305: "AG",                           // Antigua & Barbuda
  314: "BB",                                      // Barbados
  334: "HN",                                      // Honduras
  359: "TT",                                      // Trinidad & Tobago
  375: "VC", 376: "VC", 377: "VC",               // St. Vincent & Grenadines
  351: "PA", 352: "PA", 353: "PA", 354: "PA",    // Panama
  355: "PA", 356: "PA", 357: "PA",               // Panama
  370: "PA", 371: "PA", 372: "PA", 373: "PA", 374: "PA", // Panama
  306: "AN",                                      // Netherlands Antilles
  319: "KY",                                      // Cayman Islands
  378: "VG",                                      // British Virgin Islands
  // Asia / Pacific
  412: "CN", 413: "CN", 414: "CN",               // China
  563: "SG", 564: "SG", 565: "SG", 566: "SG",   // Singapore
  419: "IN",                                      // India
  533: "MY",                                      // Malaysia
  525: "ID",                                      // Indonesia
  548: "PH",                                      // Philippines
  574: "VN",                                      // Vietnam
  567: "TH",                                      // Thailand
  470: "AE",                                      // UAE
  403: "SA",                                      // Saudi Arabia
  447: "KW",                                      // Kuwait
  466: "QA",                                      // Qatar
  422: "IR",                                      // Iran
  428: "IL",                                      // Israel
  503: "AU",                                      // Australia
  512: "NZ",                                      // New Zealand
  520: "FJ",                                      // Fiji
  416: "TW",                                      // Taiwan
  477: "HK",                                      // Hong Kong
  441: "KR",                                      // South Korea
  431: "JP", 432: "JP",                           // Japan
  514: "KH", 515: "KH",                           // Cambodia
  511: "PW",                                      // Palau
  518: "CK",                                      // Cook Islands
  538: "MH",                                      // Marshall Islands
  572: "TV",                                      // Tuvalu
  576: "VU",                                      // Vanuatu
  // Africa
  636: "LR",                                      // Liberia
  601: "ZA",                                      // South Africa
  622: "EG",                                      // Egypt
  634: "KE",                                      // Kenya
  657: "MZ",                                      // Mozambique
  659: "NA",                                      // Namibia
  667: "SL",                                      // Sierra Leone
  674: "TZ",                                      // Tanzania
  677: "CM",                                      // Cameroon
  616: "KM",                                      // Comoros
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
