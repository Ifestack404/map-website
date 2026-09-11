import type { MutableRefObject, ReactNode } from "react";

/**
 * Geographic entity kinds used by the future folder-style explorer.
 * Stage 1 only declares the contract — no datasets are loaded yet.
 */
export type GeoEntityType = "continent" | "country" | "city" | "location";

/**
 * A node in the geographic hierarchy (continent → country → city).
 * Stage 2+ will populate these from GeoJSON / API data.
 */
export interface GeoEntity {
  id: string;
  name: string;
  type: GeoEntityType;
  /** Latitude in degrees, -90 (south) to 90 (north). */
  lat: number;
  /** Longitude in degrees, -180 (west) to 180 (east). */
  lng: number;
  /** Optional parent in the folder tree, e.g. a city pointing at its country. */
  parentId?: string;
}

/**
 * Named overlay groups that will mount as children of the rotating Earth group
 * so they stay glued to the planet as it spins.
 */
export type GlobeLayerId = "boundaries" | "markers" | "data";

export interface GlobeLayerDescriptor {
  id: GlobeLayerId;
  visible: boolean;
  label: string;
}

/** Live pointer/camera interaction flags shared between controls and Earth. */
export interface GlobeInteractionState {
  isInteracting: boolean;
  lastActivityAt: number;
}

export type GlobeInteractionRef = MutableRefObject<GlobeInteractionState>;

export interface EarthProps {
  interactionRef: GlobeInteractionRef;
  /** Future geographic overlays must be passed as children so they inherit Earth's rotation. */
  children?: ReactNode;
  onReady?: () => void;
}

export interface CameraControlsProps {
  interactionRef: GlobeInteractionRef;
}

export interface GlobeSceneProps {
  onGlobeReady?: () => void;
}
