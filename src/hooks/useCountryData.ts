"use client";

import { useEffect, useState } from "react";
import {
  CountryKnowledgeError,
  fetchCountryById,
} from "@/lib/supabase/countries";
import type { Country, CountryDataStatus } from "@/types/country";

export interface UseCountryDataResult {
  country: Country | null;
  status: CountryDataStatus;
  error: string | null;
}

const cache = new Map<string, Country | null>();

function snapshotFor(countryId: string | null): UseCountryDataResult {
  if (!countryId) {
    return { country: null, status: "idle", error: null };
  }

  if (cache.has(countryId)) {
    const cached = cache.get(countryId) ?? null;
    return {
      country: cached,
      status: cached ? "ready" : "empty",
      error: null,
    };
  }

  return { country: null, status: "loading", error: null };
}

/**
 * Load country knowledge for a folder/globe selection.
 * The globe tree does not subscribe to this hook.
 */
export function useCountryData(countryId: string | null): UseCountryDataResult {
  const [trackedId, setTrackedId] = useState(countryId);
  const [result, setResult] = useState<UseCountryDataResult>(() =>
    snapshotFor(countryId),
  );

  if (countryId !== trackedId) {
    setTrackedId(countryId);
    setResult(snapshotFor(countryId));
  }

  useEffect(() => {
    if (!countryId || cache.has(countryId)) return;

    let cancelled = false;

    fetchCountryById(countryId)
      .then((row) => {
        cache.set(countryId, row);
        if (cancelled) return;
        setResult({
          country: row,
          status: row ? "ready" : "empty",
          error: null,
        });
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        const message =
          caught instanceof CountryKnowledgeError
            ? caught.message
            : "Could not load country knowledge.";
        setResult({
          country: null,
          status: "error",
          error: message,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [countryId]);

  return result;
}
