import { Matrix4, Quaternion, Vector3 } from "three";
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

const east = new Vector3();
const north = new Vector3();
const normal = new Vector3();
const worldUp = new Vector3(0, 1, 0);
const basis = new Matrix4();
const orientation = new Quaternion();

/**
 * Orient text on the tangent plane: +Z outward, +Y toward north.
 * Names stay glued to the country instead of billboarding in front of the globe.
 */
function tangentQuaternion(
  x: number,
  y: number,
  z: number,
): [number, number, number, number] {
  normal.set(x, y, z).normalize();
  east.crossVectors(worldUp, normal);
  if (east.lengthSq() < 1e-10) {
    east.set(1, 0, 0);
  } else {
    east.normalize();
  }
  north.crossVectors(normal, east).normalize();
  basis.makeBasis(east, north, normal);
  orientation.setFromRotationMatrix(basis);
  return [orientation.x, orientation.y, orientation.z, orientation.w];
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
    const px = x * scale;
    const py = y * scale;
    const pz = z * scale;
    anchors.push({
      id: country.id,
      name: displayName(country.name),
      position: [px, py, pz],
      quaternion: tangentQuaternion(px, py, pz),
      importance: count,
      rank: 0,
    });
  }

  anchors.sort((a, b) => b.importance - a.importance);
  return anchors.map((anchor, rank) => ({ ...anchor, rank }));
}

function angleBetween(
  a: CountryLabelAnchor["position"],
  b: CountryLabelAnchor["position"],
): number {
  const dot =
    (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) /
    ((Math.hypot(a[0], a[1], a[2]) || 1) * (Math.hypot(b[0], b[1], b[2]) || 1));
  const clamped = Math.min(1, Math.max(-1, dot));
  return Math.acos(clamped);
}

/**
 * Keep only labels that are far enough apart on the sphere
 * so names do not stack on top of each other.
 */
export function spaceCountryLabels(
  anchors: readonly CountryLabelAnchor[],
  minAngleRadians: number,
  maxCount: number,
): CountryLabelAnchor[] {
  const kept: CountryLabelAnchor[] = [];

  for (const anchor of anchors) {
    if (kept.length >= maxCount) break;
    const collides = kept.some(
      (other) => angleBetween(anchor.position, other.position) < minAngleRadians,
    );
    if (!collides) kept.push(anchor);
  }

  return kept;
}
