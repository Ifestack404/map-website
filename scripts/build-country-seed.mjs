import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COUNTRY_ROWS } from "./country-rows.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function flagUrl(iso) {
  return iso ? `https://flagcdn.com/w160/${iso.toLowerCase()}.png` : null;
}

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

const records = COUNTRY_ROWS.map(
  ([id, name, iso_code, continent, capital, population, area, description]) => ({
    id,
    name,
    iso_code,
    continent,
    capital,
    population,
    area,
    description,
    flag_url: flagUrl(iso_code),
    created_at: "2026-01-01T00:00:00.000Z",
  }),
);

const jsonPath = path.join(root, "src/data/country-knowledge.json");
fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(records, null, 2)}\n`);

const values = records
  .map((row) => {
    return `(${[
      sqlString(row.id),
      sqlString(row.name),
      sqlString(row.iso_code),
      sqlString(row.continent),
      sqlString(row.capital),
      row.population === null ? "null" : String(row.population),
      row.area === null ? "null" : String(row.area),
      sqlString(row.description),
      sqlString(row.flag_url),
    ].join(", ")})`;
  })
  .join(",\n");

const sql = `-- Country knowledge seed. Ids match world-atlas (Stage 2/3).
-- Run after schema.sql in the Supabase SQL editor.

insert into public.countries (
  id, name, iso_code, continent, capital, population, area, description, flag_url
) values
${values}
on conflict (id) do update set
  name = excluded.name,
  iso_code = excluded.iso_code,
  continent = excluded.continent,
  capital = excluded.capital,
  population = excluded.population,
  area = excluded.area,
  description = excluded.description,
  flag_url = excluded.flag_url;
`;

fs.writeFileSync(path.join(root, "supabase/seed.sql"), sql);
console.log(`wrote ${records.length} countries`);
