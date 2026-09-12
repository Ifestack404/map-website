import type { MultiPolygon, Polygon } from "geojson";

/** GeoJSON position as used by the atlas: [longitude, latitude]. */
export type LngLat = [longitude: number, latitude: number];

/** A single linear ring. May be an exterior boundary or an interior hole. */
export type LngLatRing = LngLat[];

export interface CountryProperties {
  name: string;
}

/**
 * Normalized country record.
 * Geometry always comes from the atlas — never from a hand-written outline.
 */
export interface CountryRecord {
  /** Stable identifier (ISO 3166-1 numeric string from world-atlas). */
  id: string;
  name: string;
  /** ISO 3166-1 numeric code when the atlas provides one. */
  isoCode?: string;
  /** Present only if the source dataset includes it. world-atlas 110m does not. */
  continent?: string;
  geometry: Polygon | MultiPolygon;
  /** Pre-extracted rings so renderers do not re-walk GeoJSON every frame. */
  rings: LngLatRing[];
}

export interface WorldCountriesData {
  countries: CountryRecord[];
  byId: ReadonlyMap<string, CountryRecord>;
}

/** Precomputed label placement for a country on the globe. */
export interface CountryLabelAnchor {
  id: string;
  name: string;
  position: [x: number, y: number, z: number];
  /** Tangent-plane orientation so the glyph sits on the sphere, not in screen space. */
  quaternion: [x: number, y: number, z: number, w: number];
  /** Higher = larger country; used for zoom-based label density. */
  importance: number;
  rank: number;
}
