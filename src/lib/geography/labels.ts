import type { CountryLabelAnchor, CountryRecord, LngLatRing } from "@/types/geography";
import { getCountryLabelRadius } from "@/lib/globe-config";
import {
  latLngToCartesianInto,
  type CartesianTuple,
} from "@/lib/geography/coordinates";

const scratch: CartesianTuple = [0, 0, 0];

const SHORT_NAMES: Record<string, string> = {
  "United States of America": "United States",
  "Dem. Rep. Congo": "DR Congo",
  "Central African Rep.": "Central Africa",
  "Bosnia and Herz.": "Bosnia",
  "Falkland Is.": "Falklands",
  "Solomon Is.": "Solomon Islands",
  "N. Cyprus": "N. Cyprus",
  "S. Sudan": "South Sudan",
  "W. Sahara": "W. Sahara",
};

function displayName(name: string): string {
  return SHORT_NAMES[name] ?? name;
}

function largestRing(rings: LngLatRing[]): LngLatRing | null {
  let best: LngLatRing | null = null;
  let bestScore = -1;

  for (const ring of rings) {
    if (ring.length > bestScore) {
      best = ring;
      bestScore = ring.length;
    }
  }

  return best;
}

/**
 * Place a label at the spherical centroid of each country's largest ring.
 * Computed once from atlas geometry — not per frame.
 */
export function getCountryLabelAnchors(
  countries: readonly CountryRecord[],
  radius: number = getCountryLabelRadius(),
): CountryLabelAnchor[] {
  const anchors: CountryLabelAnchor[] = [];

  for (const country of countries) {
    const ring = largestRing(country.rings);
    if (!ring || ring.length < 3) continue;

    const last = ring.length - 1;
    const closed =
      ring[0][0] === ring[last][0] && ring[0][1] === ring[last][1];
    const count = closed ? ring.length - 1 : ring.length;
    if (count < 3) continue;

    let x = 0;
    let y = 0;
    let z = 0;

    for (let i = 0; i < count; i++) {
      const [lng, lat] = ring[i];
      latLngToCartesianInto(lat, lng, 1, scratch);
      x += scratch[0];
      y += scratch[1];
      z += scratch[2];
    }

    const length = Math.hypot(x, y, z);
    if (!(length > 1e-8)) continue;

    const scale = radius / length;
    anchors.push({
      id: country.id,
      name: displayName(country.name),
      position: [x * scale, y * scale, z * scale],
      importance: count,
      rank: 0,
    });
  }

  anchors.sort((a, b) => b.importance - a.importance);
  return anchors.map((anchor, rank) => ({ ...anchor, rank }));
}
