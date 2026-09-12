import {
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  ShapeUtils,
  Vector2,
} from "three";
import type { Position } from "geojson";
import type { CountryRecord } from "@/types/geography";
import {
  COUNTRY_HIGHLIGHT,
  getCountryHighlightRadius,
} from "@/lib/globe-config";
import { latLngToCartesianInto, type CartesianTuple } from "@/lib/geography/coordinates";

const geometryCache = new Map<string, BufferGeometry>();
const scratch: CartesianTuple = [0, 0, 0];

function dropClosingVertex(ring: Position[]): Position[] {
  if (ring.length < 2) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) {
    return ring.slice(0, -1);
  }
  return ring;
}

function unwrapRing(ring: Position[]): Vector2[] {
  const open = dropClosingVertex(ring);
  if (open.length === 0) return [];

  const points: Vector2[] = [new Vector2(open[0][0], open[0][1])];
  for (let i = 1; i < open.length; i++) {
    let lng = open[i][0];
    const prev = points[i - 1].x;
    while (lng - prev > 180) lng -= 360;
    while (lng - prev < -180) lng += 360;
    points.push(new Vector2(lng, open[i][1]));
  }

  return densifyLngLat(points, MathUtils.radToDeg(COUNTRY_HIGHLIGHT.maxStepRadians));
}

function densifyLngLat(points: Vector2[], maxDeg: number): Vector2[] {
  if (points.length < 2) return points;
  const out: Vector2[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(dist / maxDeg));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      out.push(new Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t));
    }
  }

  return out;
}

function appendPolygon(
  coordinates: Position[][],
  radius: number,
  positions: number[],
  normals: number[],
  indices: number[],
): void {
  if (coordinates.length === 0) return;

  const contour = unwrapRing(coordinates[0]);
  if (contour.length < 3) return;

  const holes = coordinates.slice(1).map(unwrapRing).filter((ring) => ring.length >= 3);

  let faces: number[][];
  try {
    faces = ShapeUtils.triangulateShape(contour, holes);
  } catch {
    return;
  }

  if (!faces || faces.length === 0) return;

  const vertices = contour.concat(...holes);
  const indexOffset = positions.length / 3;

  for (const point of vertices) {
    latLngToCartesianInto(point.y, point.x, radius, scratch);
    positions.push(scratch[0], scratch[1], scratch[2]);
    const length = Math.hypot(scratch[0], scratch[1], scratch[2]) || 1;
    normals.push(scratch[0] / length, scratch[1] / length, scratch[2] / length);
  }

  for (const face of faces) {
    if (face.length < 3) continue;
    indices.push(
      face[0] + indexOffset,
      face[1] + indexOffset,
      face[2] + indexOffset,
    );
  }
}

/**
 * Build (and cache) a spherical fill mesh for one country.
 * Only hovered/selected countries are rendered — geometry is not rebuilt on move.
 */
export function getCountryHighlightGeometry(
  country: CountryRecord,
  radius: number = getCountryHighlightRadius(),
): BufferGeometry | null {
  const cached = geometryCache.get(country.id);
  if (cached) return cached;

  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  const { geometry } = country;
  if (geometry.type === "Polygon") {
    appendPolygon(geometry.coordinates, radius, positions, normals, indices);
  } else {
    for (const polygon of geometry.coordinates) {
      appendPolygon(polygon, radius, positions, normals, indices);
    }
  }

  if (positions.length < 9 || indices.length < 3) return null;

  const mesh = new BufferGeometry();
  mesh.setAttribute("position", new Float32BufferAttribute(positions, 3));
  mesh.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  mesh.setIndex(indices);
  mesh.computeBoundingSphere();

  geometryCache.set(country.id, mesh);
  return mesh;
}
