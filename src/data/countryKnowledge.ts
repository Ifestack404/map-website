import type { Country } from "@/types/country";
import catalog from "@/data/country-knowledge.json";

const byId = new Map<string, Country>(
  (catalog as Country[]).map((row) => [row.id, row]),
);

export function getLocalCountryKnowledge(countryId: string): Country | null {
  const trimmed = countryId.trim();
  if (!trimmed) return null;

  const direct = byId.get(trimmed);
  if (direct) return direct;

  if (/^\d+$/.test(trimmed)) {
    return byId.get(trimmed.padStart(3, "0")) ?? null;
  }

  return null;
}
