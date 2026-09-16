"use client";

import dynamic from "next/dynamic";
import { FolderPanel } from "@/components/folder";
import { GlobeLoader } from "./GlobeLoader";

const GlobeCanvas = dynamic(
  () => import("./GlobeCanvas").then((mod) => mod.GlobeCanvas),
  {
    ssr: false,
    loading: () => <GlobeLoader progress={6} />,
  },
);

/**
 * Client entry for the homepage. Isolates WebGL from Next.js SSR
 * (Three.js touches `window` / the GPU during setup).
 */
export function GlobeExperience() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#020617]">
      <GlobeCanvas />
      <FolderPanel />
    </main>
  );
}
