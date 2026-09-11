import type { GeoEntity, GlobeLayerDescriptor } from "@/types/globe";

/**
 * Named globe overlays. Boundaries are live in Stage 2; markers/data stay off
 * until later stages mount real children under Earth.
 */
export function getGlobeLayers(): GlobeLayerDescriptor[] {
  return [
    { id: "boundaries", visible: true, label: "Country boundaries" },
    { id: "markers", visible: false, label: "Location markers" },
    { id: "data", visible: false, label: "Data layers" },
  ];
}

/**
 * Folder-tree nodes. Stage 2 keeps this empty — country records live in
 * `getWorldCountries()` so the folder UI can consume them in a later stage
 * without mixing geometry into the explorer list.
 */
export function getGeoHierarchy(): GeoEntity[] {
  return [];
}
