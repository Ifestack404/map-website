"use client";

import { create } from "zustand";
import {
  findCountryFolder,
  getFolderAncestry,
  getFolderById,
  pathLabelsForFolder,
} from "@/data/folders";
import { WORLD_FOLDER_ID } from "@/data/continents";
import {
  clearSelection as clearGlobeSelection,
  selectCountry as selectGlobeCountry,
} from "@/state/countrySelection";
import type { CountryRef } from "@/types/geography";
import type { FolderNode } from "@/types/folder";

export interface WorldNavigationState {
  currentFolderId: string;
  selectedCountry: CountryRef | null;
  navigationPath: string[];
  isOpen: boolean;
}

export interface WorldNavigationActions {
  openFolder: (folderId: string) => void;
  goBack: () => void;
  resetNavigation: () => void;
  selectCountry: (country: CountryRef | null) => void;
}

export type WorldNavigationStore = WorldNavigationState & WorldNavigationActions;

const WORLD_PATH = ["WORLD"];

function folderSnapshot(folderId: string): Pick<
  WorldNavigationState,
  "currentFolderId" | "navigationPath"
> {
  const folder = getFolderById(folderId);
  const id = folder?.id ?? WORLD_FOLDER_ID;
  return {
    currentFolderId: id,
    navigationPath: pathLabelsForFolder(id),
  };
}

function countryRefFromFolder(folder: FolderNode): CountryRef {
  return {
    id: folder.id,
    name: folder.name || "Unknown country",
  };
}

/**
 * World folder navigation. Independent of the Three.js render loop.
 * Stage 5 can subscribe to `selectedCountry` / `currentFolderId` for live data.
 */
export const useWorldNavigation = create<WorldNavigationStore>((set, get) => ({
  currentFolderId: WORLD_FOLDER_ID,
  selectedCountry: null,
  navigationPath: WORLD_PATH,
  isOpen: false,

  openFolder: (folderId) => {
    const folder = getFolderById(folderId);
    if (!folder) return;

    const next = folderSnapshot(folder.id);

    if (folder.type === "country") {
      const selectedCountry = countryRefFromFolder(folder);
      set({
        ...next,
        selectedCountry,
        isOpen: true,
      });
      selectGlobeCountry(selectedCountry);
      return;
    }

    set({
      ...next,
      isOpen: true,
    });
  },

  goBack: () => {
    const { currentFolderId, isOpen } = get();
    if (!isOpen) return;

    const ancestry = getFolderAncestry(currentFolderId);
    const parent = ancestry[ancestry.length - 2];
    if (!parent) {
      get().resetNavigation();
      return;
    }

    set({
      ...folderSnapshot(parent.id),
      isOpen: true,
    });
  },

  resetNavigation: () => {
    const { isOpen, selectedCountry, currentFolderId } = get();
    if (
      !isOpen &&
      !selectedCountry &&
      currentFolderId === WORLD_FOLDER_ID
    ) {
      return;
    }

    set({
      currentFolderId: WORLD_FOLDER_ID,
      selectedCountry: null,
      navigationPath: WORLD_PATH,
      isOpen: false,
    });
    clearGlobeSelection();
  },

  selectCountry: (country) => {
    if (!country) {
      get().resetNavigation();
      return;
    }

    const folder = findCountryFolder(country.id);
    if (!folder) {
      set({
        selectedCountry: {
          id: country.id,
          name: country.name || "Unknown country",
        },
        currentFolderId: WORLD_FOLDER_ID,
        navigationPath: WORLD_PATH,
        isOpen: true,
      });
      selectGlobeCountry(country);
      return;
    }

    const selectedCountry = {
      id: country.id,
      name: country.name || folder.name || "Unknown country",
    };

    set({
      ...folderSnapshot(folder.id),
      selectedCountry,
      isOpen: true,
    });
    selectGlobeCountry(selectedCountry);
  },
}));

export function getCurrentFolder(): FolderNode | undefined {
  return getFolderById(useWorldNavigation.getState().currentFolderId);
}
