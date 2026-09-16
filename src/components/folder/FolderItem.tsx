"use client";

import { motion } from "framer-motion";
import type { FolderNode } from "@/types/folder";

interface FolderItemProps {
  folder: FolderNode;
  active?: boolean;
  onOpen: (folderId: string) => void;
}

function FolderGlyph({ type }: { type: FolderNode["type"] }) {
  if (type === "country") {
    return (
      <span
        aria-hidden="true"
        className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-sky-300/80"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="mt-px inline-block h-3.5 w-3.5 rounded-[3px] border border-sky-300/50"
    />
  );
}

export function FolderItem({ folder, active = false, onOpen }: FolderItemProps) {
  const childCount = folder.children?.length ?? 0;
  const meta =
    folder.type === "continent"
      ? `${childCount} ${childCount === 1 ? "country" : "countries"}`
      : folder.type === "country"
        ? "Country"
        : "Folder";

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(folder.id)}
      aria-current={active ? "true" : undefined}
      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none ${
        active
          ? "bg-sky-400/15 text-white"
          : "text-slate-200 hover:bg-white/5 hover:text-white"
      }`}
      whileTap={{ scale: 0.985 }}
    >
      <FolderGlyph type={folder.type} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm tracking-wide">{folder.name}</span>
        <span className="mt-0.5 block text-[0.65rem] tracking-[0.14em] text-slate-400 uppercase">
          {meta}
        </span>
      </span>
    </motion.button>
  );
}
