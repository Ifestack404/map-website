"use client";

import { useEffect } from "react";
import { clearSelection } from "@/state/countrySelection";
import { useSelectedCountry } from "@/hooks/useCountryInteraction";

/**
 * Minimal Stage 3 selection chrome. Stage 4 replaces this with the folder view.
 */
export function SelectedCountry() {
  const selectedCountry = useSelectedCountry();

  useEffect(() => {
    if (!selectedCountry) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        clearSelection();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCountry]);

  if (!selectedCountry) return null;

  return (
    <aside
      className="pointer-events-auto absolute top-4 left-4 z-20 max-w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-slate-100 shadow-lg backdrop-blur-md sm:top-6 sm:left-6"
      aria-live="polite"
      aria-label={`Selected country ${selectedCountry.name}`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-medium tracking-[0.18em] text-sky-200/80 uppercase">
            Country
          </p>
          <p className="mt-1 truncate text-base font-semibold tracking-wide text-white">
            {selectedCountry.name}
          </p>
        </div>
        <button
          type="button"
          onClick={clearSelection}
          className="rounded-full p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none"
          aria-label="Deselect country"
        >
          <span aria-hidden="true" className="block h-4 w-4 text-center leading-4">
            ×
          </span>
        </button>
      </div>
    </aside>
  );
}
