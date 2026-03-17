// UN/LOCODE → human-readable port name
// Focused on ports relevant to Elbe/North Sea traffic
const LOCODE_TO_NAME: Record<string, string> = {
  // Germany
  DEHAM: "Hamburg",
  DEBRE: "Bremerhaven",
  DEHBU: "Hamburg-Harburg",
  DEDUI: "Duisburg",
  DEKEL: "Kiel",
  DELUB: "Lübeck",
  DEROS: "Rostock",
  DEWIS: "Wismar",
  DESTR: "Stralsund",
  DESXB: "Brunsbüttel",
  DECUX: "Cuxhaven",
  DESTA: "Stade",

  // Netherlands
  NLRTM: "Rotterdam",
  NLAMS: "Amsterdam",
  NLMOE: "Moerdijk",
  NLVLI: "Vlissingen",
  NLTBU: "Tilburg",

  // Belgium
  BEANR: "Antwerp",
  BEBRU: "Brussels",
  BEGNE: "Ghent",
  BEZEE: "Zeebrugge",

  // UK
  GBFXT: "Felixstowe",
  GBSOU: "Southampton",
  GBLON: "London",
  GBIMM: "Immingham",
  GBHUL: "Hull",
  GBLIV: "Liverpool",
  GBGRG: "Grangemouth",
  GBTIL: "Tilbury",

  // Denmark
  DKAAR: "Aarhus",
  DKCPH: "Copenhagen",
  DKFRC: "Fredericia",

  // Sweden
  SEGOT: "Gothenburg",
  SEMMA: "Malmö",
  SEHEL: "Helsingborg",

  // Norway
  NOOSL: "Oslo",
  NOBGO: "Bergen",
  NOSVG: "Stavanger",

  // Finland
  FIHEL: "Helsinki",
  FITUR: "Turku",

  // Poland
  PLGDN: "Gdańsk",
  PLGDY: "Gdynia",
  PLSZZ: "Szczecin",

  // Baltic states
  LVRIX: "Riga",
  EETAL: "Tallinn",
  LTKLJ: "Klaipėda",

  // France
  FRLEH: "Le Havre",
  FRDKK: "Dunkirk",
  FRMRS: "Marseille",

  // Spain / Portugal
  ESVLC: "Valencia",
  ESBCN: "Barcelona",
  ESALG: "Algeciras",
  PTLEI: "Leixões",
  PTLIS: "Lisbon",
  PTSET: "Setúbal",

  // Mediterranean
  ITGOA: "Genoa",
  ITVCE: "Venice",
  ITLIV: "Livorno",
  GRPIR: "Piraeus",
  TRIST: "Istanbul",

  // Americas
  USNYC: "New York",
  USBLT: "Baltimore",
  USSAV: "Savannah",
  USHOU: "Houston",
  USNOR: "Norfolk",
  CAHAL: "Halifax",
  BRSSZ: "Santos",

  // Asia / Middle East
  SGSIN: "Singapore",
  CNSHA: "Shanghai",
  CNNGB: "Ningbo",
  CNTXG: "Tianjin",
  HKHKG: "Hong Kong",
  KRPUS: "Busan",
  JPYOK: "Yokohama",
  AEDXB: "Dubai",
  JOAQJ: "Aqaba",

  // Misc
  MAPTM: "Tanger Med",
  EGPSD: "Port Said",
  EGSUZ: "Suez",
};

// Also handle common free-text variants that captains type
const FREETEXT_TO_NAME: Record<string, string> = {
  HAMBURG:     "Hamburg",
  BREMERHAVEN: "Bremerhaven",
  ROTTERDAM:   "Rotterdam",
  ANTWERP:     "Antwerp",
  AMSTERDAM:   "Amsterdam",
  FELIXSTOWE:  "Felixstowe",
  SINGAPORE:   "Singapore",
  CUXHAVEN:    "Cuxhaven",
  BRUNSBÜTTEL: "Brunsbüttel",
  BRUNSBUETTEL:"Brunsbüttel",
};

export function resolveDestination(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Try LOCODE (e.g. "DEHAM", "NLRTM")
  const locode = LOCODE_TO_NAME[trimmed.toUpperCase()];
  if (locode) return locode;

  // Try free-text match
  const freetext = FREETEXT_TO_NAME[trimmed.toUpperCase()];
  if (freetext) return freetext;

  // Return as-is — captain entered something readable (or unrecognised)
  return trimmed;
}
