"use client";

import { useMemo } from "react";
import { EARTH_RADIUS } from "@/lib/globe-config";
import {
  latLngToCartesianWithAltitude,
  type CartesianTuple,
} from "@/utils/coordinates";

/**
 * Stage 2 helper: memoize a globe-space position for a marker or camera target.
 * Unused in Stage 1 UI, exported so location layers can drop in without new math.
 */
export function useLatLngPosition(
  lat: number,
  lng: number,
  altitude = 0,
  radius: number = EARTH_RADIUS,
): CartesianTuple {
  return useMemo(
    () => latLngToCartesianWithAltitude(lat, lng, altitude, radius),
    [lat, lng, altitude, radius],
  );
}
