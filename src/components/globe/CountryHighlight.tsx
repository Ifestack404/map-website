"use client";

import { useMemo } from "react";
import { COUNTRY_HIGHLIGHT } from "@/lib/globe-config";
import { getCountryHighlightGeometry } from "@/lib/geography/country-mesh";
import { getCountryById } from "@/data/world";
import type { CountryRef } from "@/types/geography";

interface CountryHighlightProps {
  country: CountryRef;
  variant: "hover" | "selected";
}

export function CountryHighlight({ country, variant }: CountryHighlightProps) {
  const geometry = useMemo(() => {
    const record = getCountryById(country.id);
    return record ? getCountryHighlightGeometry(record) : null;
  }, [country.id]);

  if (!geometry) return null;

  const selected = variant === "selected";

  return (
    <mesh
      name={`country-highlight-${variant}-${country.id}`}
      geometry={geometry}
      renderOrder={1}
      raycast={() => {}}
    >
      <meshBasicMaterial
        color={selected ? COUNTRY_HIGHLIGHT.selectedColor : COUNTRY_HIGHLIGHT.hoverColor}
        transparent
        opacity={
          selected
            ? COUNTRY_HIGHLIGHT.selectedOpacity
            : COUNTRY_HIGHLIGHT.hoverOpacity
        }
        depthWrite={false}
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}
