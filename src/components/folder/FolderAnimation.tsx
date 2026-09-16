"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface FolderAnimationProps {
  folderId: string;
  children: ReactNode;
}

const panelTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1] as const,
};

/**
 * Opening and folder-level transitions. Keep this out of the 3D tree.
 */
export function FolderAnimation({ folderId, children }: FolderAnimationProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={folderId}
        initial={{ opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={panelTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function FolderPanelMotion({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="world-folder-panel"
          className="pointer-events-auto"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={panelTransition}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
