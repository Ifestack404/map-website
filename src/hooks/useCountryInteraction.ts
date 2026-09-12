"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearSelection,
  getCountrySelectionSnapshot,
  getSelectedCountry,
  hoverCountry,
  selectCountry,
  subscribeCountrySelection,
} from "@/state/countrySelection";
import type { CountryRef } from "@/types/geography";

/**
 * Subscribe to country hover/selection without re-rendering the globe tree.
 * Stage 4 can call `selectCountry` from this hook to open a folder view.
 */
export function useCountryInteraction() {
  const snapshot = useSyncExternalStore(
    subscribeCountrySelection,
    getCountrySelectionSnapshot,
    getCountrySelectionSnapshot,
  );

  const select = useCallback((country: CountryRef | null) => {
    selectCountry(country);
  }, []);

  const hover = useCallback((country: CountryRef | null) => {
    hoverCountry(country);
  }, []);

  const clear = useCallback(() => {
    clearSelection();
  }, []);

  return {
    hoveredCountry: snapshot.hoveredCountry,
    selectedCountry: snapshot.selectedCountry,
    selectCountry: select,
    hoverCountry: hover,
    clearSelection: clear,
  };
}

/** Selected-country UI can subscribe without re-rendering on hover. */
export function useSelectedCountry() {
  return useSyncExternalStore(
    subscribeCountrySelection,
    getSelectedCountry,
    getSelectedCountry,
  );
}
