import { Vector3 } from "three";
import { EARTH_RADIUS } from "@/lib/globe-config";

export type CartesianTuple = [x: number, y: number, z: number];

const DEG_TO_RAD = Math.PI / 180;

/**
 * Convert WGS-84 lat/lng (degrees) into Cartesian coordinates on a sphere.
 *
 * Matches Three.js `SphereGeometry` + equirectangular textures:
 * - Y is the polar axis (north is +Y)
 * - lng = 0, lat = 0 (Gulf of Guinea) maps to +X
 *
 * GeoJSON positions are `[lng, lat]` — callers must pass latitude first here.
 */
export function latLngToCartesian(
  latitude: number,
  longitude: number,
  radius: number = EARTH_RADIUS,
): CartesianTuple {
  const phi = (90 - latitude) * DEG_TO_RAD;
  const theta = (longitude + 180) * DEG_TO_RAD;

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}

/** Write lat/lng onto an existing tuple to avoid allocations in tight loops. */
export function latLngToCartesianInto(
  latitude: number,
  longitude: number,
  radius: number,
  target: CartesianTuple,
): void {
  const phi = (90 - latitude) * DEG_TO_RAD;
  const theta = (longitude + 180) * DEG_TO_RAD;

  target[0] = -radius * Math.sin(phi) * Math.cos(theta);
  target[1] = radius * Math.cos(phi);
  target[2] = radius * Math.sin(phi) * Math.sin(theta);
}

/**
 * Convert geographic coordinates to a Three.js point on the globe.
 * Prefer `latLngToCartesianInto` when projecting thousands of border vertices.
 */
export function latLngToVector3(
  latitude: number,
  longitude: number,
  radius: number = EARTH_RADIUS,
): Vector3 {
  const [x, y, z] = latLngToCartesian(latitude, longitude, radius);
  return new Vector3(x, y, z);
}

/**
 * Inverse of `latLngToCartesian`. Stage 3 can raycast the Earth mesh, then
 * resolve which country contains this lat/lng.
 */
export function cartesianToLatLng(
  x: number,
  y: number,
  z: number,
): { lat: number; lng: number } {
  const radius = Math.sqrt(x * x + y * y + z * z) || 1;
  const lat = 90 - (Math.acos(y / radius) * 180) / Math.PI;
  let lng = (Math.atan2(z, -x) * 180) / Math.PI - 180;

  if (lng < -180) lng += 360;
  if (lng > 180) lng -= 360;

  return { lat, lng };
}

export function vector3ToLatLng(position: Vector3): { lat: number; lng: number } {
  return cartesianToLatLng(position.x, position.y, position.z);
}

/** Surface offset along the local normal — for hovering markers above the mesh. */
export function latLngToCartesianWithAltitude(
  latitude: number,
  longitude: number,
  altitude: number,
  radius: number = EARTH_RADIUS,
): CartesianTuple {
  return latLngToCartesian(latitude, longitude, radius + altitude);
}
