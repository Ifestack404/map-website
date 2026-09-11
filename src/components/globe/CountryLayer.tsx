"use client";

import { getWorldCountries } from "@/data/world";
import { CountryBorders } from "./CountryBorders";
import { CountryLabels } from "./CountryLabels";

/**
 * Geographic overlay. Must stay a child of `Earth` so borders and names
 * spin with the texture.
 *
 * Stage 3 can add pointer handlers here and resolve hits with `getCountryById()`.
 * Each country id is the ISO 3166-1 numeric string from world-atlas (e.g. "840").
 */
export function CountryLayer() {
  const countries = getWorldCountries();

  return (
    <group name="layer-boundaries">
      <CountryBorders countries={countries} />
      <CountryLabels countries={countries} />
    </group>
  );
}
