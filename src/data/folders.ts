import { getWorldCountries } from "@/data/world";
import {
  CONTINENTS,
  WORLD_FOLDER_ID,
  continentIdFromSlug,
  continentSlugForCountry,
} from "@/data/continents";
import type { FolderNode } from "@/types/folder";

interface FolderIndex {
  root: FolderNode;
  byId: Map<string, FolderNode>;
}

let cached: FolderIndex | null = null;

function compareName(a: FolderNode, b: FolderNode): number {
  return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
}

function buildFolderIndex(): FolderIndex {
  const byId = new Map<string, FolderNode>();

  const continentNodes = CONTINENTS.map((continent) => {
    const node: FolderNode = {
      id: continent.id,
      name: continent.name,
      type: "continent",
      parentId: WORLD_FOLDER_ID,
      children: [],
    };
    byId.set(node.id, node);
    return node;
  });

  const continentsById = new Map(
    continentNodes.map((node) => [node.id, node]),
  );

  for (const country of getWorldCountries()) {
    const slug = continentSlugForCountry(country.id, country.name);
    if (!slug) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[folders] No continent mapping for ${country.id} (${country.name})`,
        );
      }
      continue;
    }
    const parent = continentsById.get(continentIdFromSlug(slug));
    if (!parent) continue;

    const node: FolderNode = {
      id: country.id,
      name: country.name || "Unknown country",
      type: "country",
      parentId: parent.id,
    };
    byId.set(node.id, node);
    parent.children = parent.children ?? [];
    parent.children.push(node);
  }

  for (const continent of continentNodes) {
    continent.children?.sort(compareName);
  }

  const root: FolderNode = {
    id: WORLD_FOLDER_ID,
    name: "World",
    type: "world",
    children: continentNodes,
  };
  byId.set(root.id, root);

  return { root, byId };
}

function getFolderIndex(): FolderIndex {
  if (!cached) cached = buildFolderIndex();
  return cached;
}

/** Root WORLD folder. Built once from the atlas + continent map. */
export function getWorldFolderTree(): FolderNode {
  return getFolderIndex().root;
}

export function getFolderById(id: string): FolderNode | undefined {
  return getFolderIndex().byId.get(id);
}

export function getFolderChildren(id: string): FolderNode[] {
  return getFolderById(id)?.children ?? [];
}

/** Root → … → current, for breadcrumbs and navigationPath. */
export function getFolderAncestry(id: string): FolderNode[] {
  const ancestry: FolderNode[] = [];
  let current = getFolderById(id);

  while (current) {
    ancestry.push(current);
    current = current.parentId ? getFolderById(current.parentId) : undefined;
  }

  ancestry.reverse();
  return ancestry.length > 0 ? ancestry : [getWorldFolderTree()];
}

export function pathLabelsForFolder(id: string): string[] {
  return getFolderAncestry(id).map((node) => node.name.toUpperCase());
}

export function findCountryFolder(countryId: string): FolderNode | undefined {
  const node = getFolderById(countryId);
  return node?.type === "country" ? node : undefined;
}
