import type { ContinentSlug } from "@/types/folder";

export const WORLD_FOLDER_ID = "world";

export interface ContinentDefinition {
  slug: ContinentSlug;
  id: string;
  name: string;
}

export const CONTINENTS: readonly ContinentDefinition[] = [
  { slug: "africa", id: "continent:africa", name: "Africa" },
  { slug: "asia", id: "continent:asia", name: "Asia" },
  { slug: "europe", id: "continent:europe", name: "Europe" },
  { slug: "north-america", id: "continent:north-america", name: "North America" },
  { slug: "south-america", id: "continent:south-america", name: "South America" },
  { slug: "oceania", id: "continent:oceania", name: "Oceania" },
  { slug: "antarctica", id: "continent:antarctica", name: "Antarctica" },
] as const;

const CONTINENT_ISO: Record<ContinentSlug, readonly string[]> = {
  africa: [
    "012", "024", "072", "108", "120", "140", "148", "178", "180", "204",
    "226", "231", "232", "262", "266", "270", "288", "324", "384", "404", "426",
    "430", "434", "450", "454", "466", "478", "504", "508", "516", "562",
    "566", "624", "646", "686", "694", "706", "710", "716", "728", "729", "834",
    "732", "748", "768", "788", "800", "818", "854", "894",
  ],
  asia: [
    "004", "031", "050", "051", "064", "096", "104", "116", "144", "156",
    "158", "196", "268", "275", "356", "360", "364", "368", "376", "392",
    "398", "400", "408", "410", "414", "417", "418", "422", "458", "496",
    "512", "524", "586", "608", "626", "634", "682", "702", "704", "760",
    "762", "764", "784", "792", "795", "860", "887",
  ],
  europe: [
    "008", "040", "056", "070", "100", "112", "191", "203", "208", "233",
    "246", "250", "276", "300", "348", "352", "372", "380", "428", "440",
    "442", "498", "499", "528", "578", "616", "620", "642", "643", "688",
    "703", "705", "724", "752", "756", "804", "807", "826",
  ],
  "north-america": [
    "044", "084", "124", "188", "192", "214", "222", "304", "320", "332",
    "340", "388", "484", "558", "591", "630", "780", "840",
  ],
  "south-america": [
    "032", "068", "076", "152", "170", "218", "238", "328", "600", "604",
    "740", "858", "862",
  ],
  oceania: ["036", "090", "242", "540", "548", "554", "598"],
  antarctica: ["010", "260"],
};

const NAME_TO_CONTINENT: Record<string, ContinentSlug> = {
  Kosovo: "europe",
  Somaliland: "africa",
  "N. Cyprus": "asia",
};

const ISO_TO_CONTINENT: Record<string, ContinentSlug> = {};

for (const [slug, codes] of Object.entries(CONTINENT_ISO) as [
  ContinentSlug,
  readonly string[],
][]) {
  for (const code of codes) {
    ISO_TO_CONTINENT[code] = slug;
  }
}

export function continentIdFromSlug(slug: ContinentSlug): string {
  return `continent:${slug}`;
}

/**
 * Resolve a country to a continent using ISO numeric ids from world-atlas,
 * then a name fallback for territories without a standard code.
 */
export function continentSlugForCountry(
  countryId: string,
  countryName: string,
): ContinentSlug | null {
  const padded = countryId.padStart(3, "0");
  return (
    ISO_TO_CONTINENT[padded] ??
    ISO_TO_CONTINENT[countryId] ??
    NAME_TO_CONTINENT[countryName] ??
    null
  );
}
