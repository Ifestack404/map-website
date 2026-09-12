import type { Position } from "geojson";
import type { CountryRecord, CountryRef, GeoBBox } from "@/types/geography";
import { getWorldCountries } from "@/data/world";

const UNKNOWN_COUNTRY = "Unknown country";

function bboxContains(bbox: GeoBBox, lng: number, lat: number): boolean {
  if (lat < bbox.minLat || lat > bbox.maxLat) return false;
  if (bbox.crossesAntimeridian) return true;
  return lng >= bbox.minLng && lng <= bbox.maxLng;
}

/**
 * Even-odd ray test in lng/lat. Ring may be closed (duplicate first/last).
 */
function pointInRing(lng: number, lat: number, ring: Position[]): boolean {
  let inside = false;
  const count = ring.length;

  for (let i = 0, j = count - 1; i < count; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 0.0) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

function unwrapLng(lng: number, prev: number): number {
  let next = lng;
  while (next - prev > 180) next -= 360;
  while (next - prev < -180) next += 360;
  return next;
}

function pointInPolygonCoordinates(
  lng: number,
  lat: number,
  coordinates: Position[][],
): boolean {
  if (coordinates.length === 0) return false;

  const exterior = coordinates[0];
  if (exterior.length < 3) return false;

  const unwrapped: Position[] = [];
  let prevLng = exterior[0][0];
  unwrapped.push([prevLng, exterior[0][1]]);
  for (let i = 1; i < exterior.length; i++) {
    const nextLng = unwrapLng(exterior[i][0], prevLng);
    unwrapped.push([nextLng, exterior[i][1]]);
    prevLng = nextLng;
  }

  let testLng = lng;
  const span = unwrapped[unwrapped.length - 1]
    ? Math.max(...unwrapped.map((p) => p[0])) - Math.min(...unwrapped.map((p) => p[0]))
    : 0;
  if (span > 180) {
    // Already unwrapped; shift the test point onto the same branch.
    const minLng = Math.min(...unwrapped.map((p) => p[0]));
    const maxLng = Math.max(...unwrapped.map((p) => p[0]));
    while (testLng < minLng) testLng += 360;
    while (testLng > maxLng) testLng -= 360;
  }

  if (!pointInRing(testLng, lat, unwrapped)) return false;

  for (let h = 1; h < coordinates.length; h++) {
    if (pointInRing(lng, lat, coordinates[h])) return false;
  }

  return true;
}

export function countryContainsLatLng(
  country: CountryRecord,
  lat: number,
  lng: number,
): boolean {
  if (!bboxContains(country.bbox, lng, lat)) return false;

  const { geometry } = country;
  if (geometry.type === "Polygon") {
    return pointInPolygonCoordinates(lng, lat, geometry.coordinates);
  }

  for (const polygon of geometry.coordinates) {
    if (pointInPolygonCoordinates(lng, lat, polygon)) return true;
  }

  return false;
}

export function findCountryAtLatLng(
  lat: number,
  lng: number,
  countries: readonly CountryRecord[] = getWorldCountries(),
): CountryRef | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  for (const country of countries) {
    if (countryContainsLatLng(country, lat, lng)) {
      return {
        id: country.id,
        name: country.name?.trim() || UNKNOWN_COUNTRY,
      };
    }
  }

  return null;
}

export function toCountryRef(country: CountryRecord | CountryRef | null | undefined): CountryRef | null {
  if (!country) return null;
  const name = country.name?.trim();
  return {
    id: country.id,
    name: name && name.length > 0 ? name : UNKNOWN_COUNTRY,
  };
}
