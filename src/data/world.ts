import countries110m from "world-atlas/countries-110m.json";
import type { Topology } from "topojson-specification";
import { countriesFromTopology } from "@/lib/geography/geojson";
import type { CountryRecord, WorldCountriesData } from "@/types/geography";

let cached: WorldCountriesData | null = null;

/**
 * Application-facing geographic dataset.
 * Loaded once from world-atlas 110m; safe to call from client or server.
 */
export function getWorldCountriesData(): WorldCountriesData {
  if (cached) return cached;

  const countries = countriesFromTopology(
    countries110m as unknown as Topology,
  );
  cached = {
    countries,
    byId: new Map(countries.map((country) => [country.id, country])),
  };

  return cached;
}

export function getWorldCountries(): CountryRecord[] {
  return getWorldCountriesData().countries;
}

export function getCountryById(id: string): CountryRecord | undefined {
  return getWorldCountriesData().byId.get(id);
}
