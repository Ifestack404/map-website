"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, MeshBasicMaterial } from "three";
import { COUNTRY_HIGHLIGHT } from "@/lib/globe-config";
import { getCountryHighlightGeometry } from "@/lib/geography/country-mesh";
import { getCountryById } from "@/data/world";
import type { CountryRef } from "@/types/geography";

interface CountryFocusProps {
  country: CountryRef;
}

/**
 * Keeps the selected country visually important with a soft pulse.
 * Does not own selection — parent passes the selected country ref.
 */
export function CountryFocus({ country }: CountryFocusProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshBasicMaterial>(null);

  const geometry = useMemo(() => {
    const record = getCountryById(country.id);
    return record ? getCountryHighlightGeometry(record) : null;
  }, [country.id]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current) return;
    const pulse = 0.012 + Math.sin(clock.elapsedTime * 2.1) * 0.006;
    meshRef.current.scale.setScalar(1 + pulse);
    materialRef.current.opacity =
      COUNTRY_HIGHLIGHT.selectedOpacity + Math.sin(clock.elapsedTime * 2.1) * 0.06;
  });

  if (!geometry) return null;

  return (
    <mesh
      ref={meshRef}
      name={`country-focus-${country.id}`}
      geometry={geometry}
      renderOrder={2}
      raycast={() => {}}
    >
      <meshBasicMaterial
        ref={materialRef}
        color={COUNTRY_HIGHLIGHT.selectedColor}
        transparent
        opacity={COUNTRY_HIGHLIGHT.selectedOpacity}
        depthWrite={false}
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}
