"use client";

import { getWorldCountries } from "@/data/world";
import { CountryBorders } from "./CountryBorders";
import { CountryInteraction } from "./CountryInteraction";
import { CountryLabels } from "./CountryLabels";

/**
 * Geographic overlay. Must stay a child of `Earth` so borders, names,
 * and highlights spin with the texture.
 */
export function CountryLayer() {
  const countries = getWorldCountries();

  return (
    <group name="layer-boundaries">
      <CountryInteraction />
      <CountryBorders countries={countries} />
      <CountryLabels countries={countries} />
    </group>
  );
}
