"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";
import { GLOBE_BACKGROUND, GLOBE_CAMERA } from "@/lib/globe-config";
import { clearSelection, pointerGesture } from "@/state/countrySelection";
import { GlobeLoader } from "./GlobeLoader";
import { GlobeScene } from "./GlobeScene";

function LoaderOverlay({ isReady }: { isReady: boolean }) {
  const { progress, total } = useProgress();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    const timeout = window.setTimeout(() => setHidden(true), 480);
    return () => window.clearTimeout(timeout);
  }, [isReady]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setHidden(true), 12000);
    return () => window.clearTimeout(timeout);
  }, []);

  if (hidden) return null;

  const percent = isReady
    ? 100
    : total === 0
      ? Math.max(8, Math.round(progress * 0.4))
      : Math.max(8, Math.round(progress));

  return <GlobeLoader progress={percent} fading={isReady} />;
}

/**
 * WebGL surface + HTML overlays.
 * Dynamically imported with SSR disabled from GlobeExperience.
 */
export function GlobeCanvas() {
  const [isReady, setIsReady] = useState(false);
  const handleReady = useCallback(() => setIsReady(true), []);

  return (
    <div className="absolute inset-0 touch-none select-none">
      <Canvas
        camera={{
          position: [...GLOBE_CAMERA.position],
          fov: GLOBE_CAMERA.fov,
          near: GLOBE_CAMERA.near,
          far: GLOBE_CAMERA.far,
        }}
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
          gl.setClearColor(GLOBE_BACKGROUND, 1);
        }}
        onPointerDown={(event) => {
          pointerGesture.x = event.clientX;
          pointerGesture.y = event.clientY;
          pointerGesture.moved = false;
        }}
        onPointerMissed={(event) => {
          const dx = event.clientX - pointerGesture.x;
          const dy = event.clientY - pointerGesture.y;
          const pointerType =
            "pointerType" in event ? String(event.pointerType) : "mouse";
          const threshold = pointerType === "touch" ? 18 : 8;
          if (Math.hypot(dx, dy) < threshold && !pointerGesture.moved) {
            clearSelection();
          }
        }}
      >
        <Suspense fallback={null}>
          <GlobeScene onGlobeReady={handleReady} />
        </Suspense>
      </Canvas>

      <LoaderOverlay isReady={isReady} />
    </div>
  );
}
