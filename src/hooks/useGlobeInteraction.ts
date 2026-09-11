"use client";

import { useRef } from "react";
import type { GlobeInteractionRef } from "@/types/globe";

/**
 * Shared mutable interaction clock.
 * A ref is used (not React state) so OrbitControls events do not trigger re-renders
 * every pointer move — the Earth animation loop reads this at 60fps instead.
 */
export function useGlobeInteraction(): GlobeInteractionRef {
  return useRef({
    isInteracting: false,
    lastActivityAt: 0,
  });
}
