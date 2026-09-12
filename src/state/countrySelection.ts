import type { CountryRef } from "@/types/geography";

export interface PointerGesture {
  x: number;
  y: number;
  moved: boolean;
}

export interface CountrySelectionSnapshot {
  hoveredCountry: CountryRef | null;
  selectedCountry: CountryRef | null;
}

type Listener = () => void;

const listeners = new Set<Listener>();

let hoveredCountry: CountryRef | null = null;
let selectedCountry: CountryRef | null = null;
let snapshot: CountrySelectionSnapshot = {
  hoveredCountry: null,
  selectedCountry: null,
};

export const pointerGesture: PointerGesture = {
  x: 0,
  y: 0,
  moved: false,
};

const sameCountry = (a: CountryRef | null, b: CountryRef | null) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.id === b.id;
};

function emit() {
  snapshot = {
    hoveredCountry,
    selectedCountry,
  };
  listeners.forEach((listener) => listener());
}

export function subscribeCountrySelection(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCountrySelectionSnapshot(): CountrySelectionSnapshot {
  return snapshot;
}

/**
 * Stage 4 entry point: persist a country click without touching globe rendering.
 */
export function selectCountry(country: CountryRef | null): void {
  if (sameCountry(selectedCountry, country)) return;
  selectedCountry = country;
  emit();
}

export function hoverCountry(country: CountryRef | null): void {
  if (sameCountry(hoveredCountry, country)) return;
  hoveredCountry = country;
  emit();
}

export function clearSelection(): void {
  if (!selectedCountry) return;
  selectedCountry = null;
  emit();
}

export function getSelectedCountry(): CountryRef | null {
  return selectedCountry;
}

export function getHoveredCountry(): CountryRef | null {
  return hoveredCountry;
}
