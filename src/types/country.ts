/**
 * Country knowledge row. Matches `public.countries` in Supabase.
 * Geometry still lives in the atlas — this is descriptive data only.
 */
export interface Country {
  id: string;
  name: string;
  iso_code: string | null;
  continent: string | null;
  capital: string | null;
  population: number | null;
  area: number | null;
  description: string | null;
  flag_url: string | null;
  created_at: string;
}

/**
 * Future image / landmark / map records.
 * Stage 5 defines the contract; storage and queries come later.
 */
export type CountryMediaKind = "image" | "landmark" | "map";

export interface CountryMedia {
  id: string;
  country_id: string;
  kind: CountryMediaKind;
  url: string;
  title: string | null;
  created_at: string;
}

export type CountryDataStatus = "idle" | "loading" | "ready" | "empty" | "error";
