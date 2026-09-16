"use client";

import { useState } from "react";
import { useCountryData } from "@/hooks/useCountryData";

interface CountryInfoProps {
  countryId: string;
  fallbackName?: string;
}

function formatPopulation(value: number): string {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(value);
}

function formatArea(value: number): string {
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(value)} km²`;
}

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.62rem] tracking-[0.16em] text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-1 truncate text-sm tracking-wide text-slate-100">
        {value ?? "Unknown"}
      </p>
    </div>
  );
}

function CountryInfoSkeleton() {
  return (
    <div className="space-y-4 px-3 py-3" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="h-10 w-14 animate-pulse rounded-md bg-white/10" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
          <div className="h-5 w-36 animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 animate-pulse rounded-lg bg-white/5" />
        <div className="h-10 animate-pulse rounded-lg bg-white/5" />
      </div>
      <div className="h-16 animate-pulse rounded-lg bg-white/5" />
    </div>
  );
}

export function CountryInfo({ countryId, fallbackName }: CountryInfoProps) {
  const { country, status, error } = useCountryData(countryId);
  const [flagFailed, setFlagFailed] = useState(false);
  const displayName = country?.name ?? fallbackName ?? "Unknown country";

  if (status === "loading") {
    return <CountryInfoSkeleton />;
  }

  if (status === "error") {
    return (
      <div className="px-3 py-3" role="alert">
        <p className="text-[0.65rem] tracking-[0.18em] text-sky-200/80 uppercase">
          Country
        </p>
        <p className="mt-2 text-lg font-medium tracking-wide text-white">
          {displayName}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-rose-200/80">
          {error ?? "Could not load country knowledge."}
        </p>
      </div>
    );
  }

  if (status === "empty" || !country) {
    return (
      <div className="px-3 py-3">
        <p className="text-[0.65rem] tracking-[0.18em] text-sky-200/80 uppercase">
          Country
        </p>
        <p className="mt-2 text-lg font-medium tracking-wide text-white">
          {displayName}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          No archive entry yet for this country. The globe folder still works.
        </p>
      </div>
    );
  }

  const showFlag = Boolean(country.flag_url) && !flagFailed;

  return (
    <article className="px-3 py-3" aria-label={`${country.name} country information`}>
      <div className="flex items-start gap-3">
        {showFlag ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={country.flag_url ?? undefined}
            alt={`${country.name} flag`}
            className="mt-0.5 h-10 w-14 shrink-0 rounded-md border border-white/10 object-cover"
            onError={() => setFlagFailed(true)}
          />
        ) : (
          <span
            aria-hidden="true"
            className="mt-1 inline-block h-3.5 w-3.5 rounded-[3px] border border-sky-300/50"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[0.62rem] tracking-[0.18em] text-sky-200/80 uppercase">
            {country.continent ?? "Country"}
          </p>
          <h2 className="mt-1 text-lg font-medium tracking-wide text-white">
            {country.name}
          </h2>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <dt className="sr-only">Capital</dt>
          <Stat label="Capital" value={country.capital} />
        </div>
        <div>
          <dt className="sr-only">Population</dt>
          <Stat
            label="Population"
            value={
              country.population !== null
                ? formatPopulation(country.population)
                : null
            }
          />
        </div>
        <div className="col-span-2">
          <dt className="sr-only">Area</dt>
          <Stat
            label="Area"
            value={country.area !== null ? formatArea(country.area) : null}
          />
        </div>
      </dl>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        {country.description ?? "No description is available yet."}
      </p>
    </article>
  );
}
