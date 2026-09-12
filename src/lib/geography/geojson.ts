import { feature } from "topojson-client";
import type {
  Feature,
  FeatureCollection,
  Geometry,
  MultiPolygon,
  Polygon,
  Position,
} from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import type {
  CountryProperties,
  CountryRecord,
  GeoBBox,
  LngLat,
  LngLatRing,
} from "@/types/geography";

type WorldAtlasObjects = {
  countries: GeometryCollection<CountryProperties>;
  land: GeometryCollection;
};

type WorldAtlasTopology = Topology<WorldAtlasObjects>;

interface CountryFeatureProperties {
  name?: string;
}

/**
 * Convert a world-atlas TopoJSON topology into normalized country records.
 * Geometry stays the atlas source of truth — we only unwrap and index it.
 */
export function countriesFromTopology(
  topology: Topology,
): CountryRecord[] {
  const world = topology as WorldAtlasTopology;
  const collection = feature(
    world,
    world.objects.countries,
  ) as FeatureCollection<Geometry, CountryFeatureProperties>;

  const countries: CountryRecord[] = [];

  for (const geoFeature of collection.features) {
    const record = toCountryRecord(geoFeature);
    if (record) countries.push(record);
  }

  return countries;
}

function toCountryRecord(
  geoFeature: Feature<Geometry, CountryFeatureProperties>,
): CountryRecord | null {
  const { geometry } = geoFeature;
  if (!isPolygonGeometry(geometry)) return null;

  const name = geoFeature.properties?.name?.trim();
  if (!name) return null;

  const rawId = geoFeature.id;
  const isoCode =
    rawId !== undefined && rawId !== null && String(rawId) !== ""
      ? String(rawId)
      : undefined;
  const id = isoCode ?? `name:${name}`;

  const rings = extractPolygonRings(geometry);

  return {
    id,
    name,
    isoCode,
    geometry,
    rings,
    bbox: bboxFromRings(rings),
  };
}

function isPolygonGeometry(
  geometry: Geometry | null | undefined,
): geometry is Polygon | MultiPolygon {
  return geometry?.type === "Polygon" || geometry?.type === "MultiPolygon";
}

function asLngLat(position: Position): LngLat {
  return [position[0], position[1]];
}

/**
 * Flatten Polygon and MultiPolygon into rings (exterior + holes).
 * Islands and overseas territories arrive as extra polygons on a MultiPolygon.
 */
export function extractPolygonRings(
  geometry: Polygon | MultiPolygon,
): LngLatRing[] {
  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => ring.map(asLngLat));
  }

  const rings: LngLatRing[] = [];
  for (const polygon of geometry.coordinates) {
    for (const ring of polygon) {
      rings.push(ring.map(asLngLat));
    }
  }
  return rings;
}

function bboxFromRings(rings: LngLatRing[]): GeoBBox {
  let minLng = 180;
  let maxLng = -180;
  let minLat = 90;
  let maxLat = -90;

  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }

  return {
    minLng,
    maxLng,
    minLat,
    maxLat,
    crossesAntimeridian: maxLng - minLng > 180,
  };
}
