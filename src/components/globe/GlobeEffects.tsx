"use client";

import { useMemo } from "react";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useSelectedCountry } from "@/hooks/useCountryInteraction";

/**
 * Subtle cinematic post-processing. Bloom is dialed down on mobile.
 */
export function GlobeEffects() {
  const selected = useSelectedCountry();
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  }, []);

  const bloom = useMemo(() => {
    if (isMobile) {
      return { intensity: 0.28, luminanceThreshold: 0.88, levels: 4 };
    }
    return {
      intensity: selected ? 0.48 : 0.34,
      luminanceThreshold: 0.8,
      levels: 6,
    };
  }, [isMobile, selected]);

  return (
    <EffectComposer multisampling={isMobile ? 0 : 2}>
      <Bloom
        intensity={bloom.intensity}
        luminanceThreshold={bloom.luminanceThreshold}
        mipmapBlur
        levels={bloom.levels}
      />
      <Vignette eskil={false} offset={0.12} darkness={isMobile ? 0.4 : 0.52} />
    </EffectComposer>
  );
}
