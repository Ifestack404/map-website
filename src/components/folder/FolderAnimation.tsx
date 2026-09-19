"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface FolderAnimationProps {
  folderId: string;
  children: ReactNode;
}

const panelTransition = {
  duration: 0.38,
  ease: [0.22, 1, 0.36, 1] as const,
};

/**
 * Opening and folder-level transitions. Keep this out of the 3D tree.
 * Stage 6: slightly longer, globe-linked motion so the panel feels like a
 * geographic OS surface — not a dashboard slide-over.
 */
export function FolderAnimation({ folderId, children }: FolderAnimationProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={folderId}
        initial={{ opacity: 0, x: 18, filter: "blur(4px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: -12, filter: "blur(2px)" }}
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
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.85 }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
