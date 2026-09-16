"use client";

import { motion } from "framer-motion";
import type { FolderNode } from "@/types/folder";

interface BreadcrumbProps {
  path: FolderNode[];
  onOpen: (folderId: string) => void;
}

export function Breadcrumb({ path, onOpen }: BreadcrumbProps) {
  if (path.length === 0) return null;

  return (
    <nav aria-label="Folder path">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] tracking-[0.16em] text-slate-400 uppercase">
        {path.map((folder, index) => {
          const current = index === path.length - 1;
          return (
            <li key={folder.id} className="flex min-w-0 items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-sky-300/40">
                  /
                </span>
              ) : null}
              {current ? (
                <span
                  className="truncate font-medium text-sky-100"
                  aria-current="page"
                >
                  {folder.name.toUpperCase()}
                </span>
              ) : (
                <motion.button
                  type="button"
                  onClick={() => onOpen(folder.id)}
                  className="truncate rounded-sm text-slate-400 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none"
                  whileTap={{ scale: 0.98 }}
                >
                  {folder.name.toUpperCase()}
                </motion.button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
