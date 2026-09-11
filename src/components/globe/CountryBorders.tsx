"use client";

import { useEffect, useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { COUNTRY_BORDERS } from "@/lib/globe-config";
import { projectCountryRingsToLinePositions } from "@/lib/geography/projection";
import type { CountryRecord } from "@/types/geography";

interface CountryBordersProps {
  countries: readonly CountryRecord[];
}

/**
 * Single LineSegments draw for every country outline.
 * Geometry is built once from the cached atlas records — not per frame,
 * and not as React state per vertex.
 */
export function CountryBorders({ countries }: CountryBordersProps) {
  const geometry = useMemo(() => {
    const positions = projectCountryRingsToLinePositions(countries);
    const borderGeometry = new BufferGeometry();
    borderGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(positions, 3),
    );
    borderGeometry.computeBoundingSphere();
    return borderGeometry;
  }, [countries]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <lineSegments geometry={geometry} renderOrder={2}>
      <lineBasicMaterial
        color={COUNTRY_BORDERS.color}
        transparent
        opacity={COUNTRY_BORDERS.opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
}
