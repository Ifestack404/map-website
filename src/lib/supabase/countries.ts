import type { Country } from "@/types/country";
import { getLocalCountryKnowledge } from "@/data/countryKnowledge";
import { getSupabaseClient, isSupabaseConfigured } from "./client";

export class CountryKnowledgeError extends Error {
  constructor(
    message: string,
    readonly code: "not_configured" | "query_failed",
  ) {
    super(message);
    this.name = "CountryKnowledgeError";
  }
}

const COUNTRY_COLUMNS =
  "id, name, iso_code, continent, capital, population, area, description, flag_url, created_at";

function lookupIds(countryId: string): string[] {
  const trimmed = countryId.trim();
  if (!trimmed) return [];
  const padded = /^\d+$/.test(trimmed) ? trimmed.padStart(3, "0") : trimmed;
  return padded === trimmed ? [trimmed] : [trimmed, padded];
}

function toFiniteNumber(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toCountry(row: Country): Country {
  return {
    id: row.id,
    name: row.name || "Unknown country",
    iso_code: row.iso_code ?? null,
    continent: row.continent ?? null,
    capital: row.capital ?? null,
    population: toFiniteNumber(row.population),
    area: toFiniteNumber(row.area),
    description: row.description ?? null,
    flag_url: row.flag_url ?? null,
    created_at: row.created_at,
  };
}

/**
 * Fetch one country knowledge row.
 * Uses Supabase when configured; otherwise reads the local seed catalog
 * so the explorer still works before a project is connected.
 */
export async function fetchCountryById(
  countryId: string,
): Promise<Country | null> {
  if (!isSupabaseConfigured()) {
    const local = getLocalCountryKnowledge(countryId);
    return local ? toCountry(local) : null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new CountryKnowledgeError(
      "Country knowledge is not connected.",
      "not_configured",
    );
  }

  const ids = lookupIds(countryId);
  if (ids.length === 0) return null;

  const { data, error } = await supabase
    .from("countries")
    .select(COUNTRY_COLUMNS)
    .in("id", ids)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new CountryKnowledgeError(
      "Could not load country knowledge.",
      "query_failed",
    );
  }

  return data ? toCountry(data as Country) : null;
}
