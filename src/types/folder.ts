/**
 * Geographic folder tree. Shape is stable so Stage 5 can swap
 * the local builder for a database without changing the UI.
 */
export type FolderType = "world" | "continent" | "country";

export type ContinentSlug =
  | "africa"
  | "antarctica"
  | "asia"
  | "europe"
  | "north-america"
  | "oceania"
  | "south-america";

export interface FolderNode {
  id: string;
  name: string;
  type: FolderType;
  parentId?: string;
  children?: FolderNode[];
}

export interface FolderRef {
  id: string;
  name: string;
  type: FolderType;
}
