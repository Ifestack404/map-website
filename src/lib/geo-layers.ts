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
 * Folder-tree nodes. The live explorer reads `getWorldFolderTree()`
 * so this helper can later expose a flattened API view without
 * mixing geometry into the folder panel.
 */
export function getGeoHierarchy(): GeoEntity[] {
  return [];
}
