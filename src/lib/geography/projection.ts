import type { CountryRecord, LngLatRing } from "@/types/geography";
import {
  COUNTRY_BORDERS,
  getCountryBorderRadius,
} from "@/lib/globe-config";
import {
  latLngToCartesianInto,
  type CartesianTuple,
} from "@/lib/geography/coordinates";

const scratchA: CartesianTuple = [0, 0, 0];
const scratchB: CartesianTuple = [0, 0, 0];

/**
 * Walk a ring, slerp each edge onto the sphere, and emit LineSegments pairs.
 * Shared by every country so curvature is consistent.
 */
export function projectCountryRingsToLinePositions(
  countries: readonly CountryRecord[],
  radius: number = getCountryBorderRadius(),
  maxStepRadians: number = COUNTRY_BORDERS.maxStepRadians,
): Float32Array {
  const positions: number[] = [];

  for (const country of countries) {
    for (const ring of country.rings) {
      appendRingSegments(ring, radius, maxStepRadians, positions);
    }
  }

  return new Float32Array(positions);
}

function appendRingSegments(
  ring: LngLatRing,
  radius: number,
  maxStepRadians: number,
  positions: number[],
): void {
  if (ring.length < 2) return;

  latLngToCartesianInto(ring[0][1], ring[0][0], radius, scratchA);

  for (let i = 1; i < ring.length; i++) {
    const point = ring[i];
    latLngToCartesianInto(point[1], point[0], radius, scratchB);
    appendSphericalChord(scratchA, scratchB, radius, maxStepRadians, positions);
    scratchA[0] = scratchB[0];
    scratchA[1] = scratchB[1];
    scratchA[2] = scratchB[2];
  }
}

/**
 * Interpolate along the short great-circle arc between two globe points.
 * That keeps long borders (Sahara, Russia, Australia) on the surface
 * instead of cutting chords through the planet.
 */
function appendSphericalChord(
  a: CartesianTuple,
  b: CartesianTuple,
  radius: number,
  maxStepRadians: number,
  positions: number[],
): void {
  const invR2 = 1 / (radius * radius);
  let dot = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) * invR2;
  if (dot > 1) dot = 1;
  else if (dot < -1) dot = -1;

  const omega = Math.acos(dot);
  if (!(omega > 1e-7)) return;

  const steps = Math.max(1, Math.ceil(omega / maxStepRadians));
  if (steps === 1) {
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    return;
  }

  const sinOmega = Math.sin(omega);
  let prevX = a[0];
  let prevY = a[1];
  let prevZ = a[2];

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const s0 = Math.sin((1 - t) * omega) / sinOmega;
    const s1 = Math.sin(t * omega) / sinOmega;
    let x = s0 * a[0] + s1 * b[0];
    let y = s0 * a[1] + s1 * b[1];
    let z = s0 * a[2] + s1 * b[2];
    const length = Math.hypot(x, y, z) || 1;
    const scale = radius / length;
    x *= scale;
    y *= scale;
    z *= scale;
    positions.push(prevX, prevY, prevZ, x, y, z);
    prevX = x;
    prevY = y;
    prevZ = z;
  }
}
