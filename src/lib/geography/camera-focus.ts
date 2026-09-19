import { Vector3 } from "three";
import {
  CAMERA_FOCUS,
  EARTH_RADIUS,
} from "@/lib/globe-config";
import { latLngToCartesianInto, type CartesianTuple } from "@/lib/geography/coordinates";
import type { CountryRecord, LngLatRing } from "@/types/geography";

const scratch: CartesianTuple = [0, 0, 0];

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
 * Geographic center of a country (spherical centroid of the largest ring).
 * Kept separate from React so camera and glow code share one calculation.
 */
export function getCountryCenterLatLng(country: CountryRecord): {
  lat: number;
  lng: number;
} {
  const ring = largestRing(country.rings);
  if (!ring || ring.length < 3) {
    const { minLat, maxLat, minLng, maxLng } = country.bbox;
    return {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    };
  }

  const last = ring.length - 1;
  const closed =
    ring[0][0] === ring[last][0] && ring[0][1] === ring[last][1];
  const count = closed ? ring.length - 1 : ring.length;

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

  const length = Math.hypot(x, y, z) || 1;
  const nx = x / length;
  const ny = y / length;
  const nz = z / length;

  const lat = 90 - (Math.acos(Math.min(1, Math.max(-1, ny))) * 180) / Math.PI;
  let lng = (Math.atan2(nz, -nx) * 180) / Math.PI - 180;
  if (lng < -180) lng += 360;
  if (lng > 180) lng -= 360;

  return { lat, lng };
}

export interface CameraFocusPose {
  /** Earth-local camera position (apply earth.localToWorld before use). */
  localPosition: Vector3;
  /** Earth-local look-at target. */
  localTarget: Vector3;
  /** Surface point in earth-local space. */
  localSurface: Vector3;
}

export function getFocusDistance(isMobile: boolean): number {
  return isMobile
    ? CAMERA_FOCUS.mobileFocusDistance
    : CAMERA_FOCUS.focusDistance;
}

/**
 * Build an earth-local camera pose aimed at a country center.
 * Callers transform with the Earth group's matrix so idle spin stays correct.
 */
export function getCountryCameraPose(
  lat: number,
  lng: number,
  options?: { isMobile?: boolean; radius?: number },
): CameraFocusPose {
  const radius = options?.radius ?? EARTH_RADIUS;
  const distance = getFocusDistance(options?.isMobile ?? false);

  latLngToCartesianInto(lat, lng, radius, scratch);
  const localSurface = new Vector3(scratch[0], scratch[1], scratch[2]);
  const localPosition = localSurface.clone().normalize().multiplyScalar(distance);
  const localTarget = localSurface.clone().multiplyScalar(0.32);

  return { localPosition, localTarget, localSurface };
}

export function getIdleCameraPose(): CameraFocusPose {
  return {
    localPosition: new Vector3(0, 0.35, CAMERA_FOCUS.idleDistance),
    localTarget: new Vector3(0, 0, 0),
    localSurface: new Vector3(0, 0, EARTH_RADIUS),
  };
}

export function easeInOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
