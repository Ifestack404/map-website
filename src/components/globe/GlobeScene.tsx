"use client";

import { AdaptiveDpr, Stars } from "@react-three/drei";
import { GLOBE_BACKGROUND, GLOBE_LIGHTING } from "@/lib/globe-config";
import { useGlobeInteraction } from "@/hooks/useGlobeInteraction";
import type { GlobeSceneProps } from "@/types/globe";
import { CameraAnimator } from "./CameraAnimator";
import { CameraControls } from "./CameraControls";
import { CountryLayer } from "./CountryLayer";
import { Earth } from "./Earth";
import { GlobeEffects } from "./GlobeEffects";

function GlobeLighting() {
  const { ambient, sun, hemisphere } = GLOBE_LIGHTING;

  return (
    <>
      <ambientLight intensity={ambient.intensity} color={ambient.color} />
      <hemisphereLight
        color={hemisphere.sky}
        groundColor={hemisphere.ground}
        intensity={hemisphere.intensity}
      />
      <directionalLight
        position={[...sun.position]}
        intensity={sun.intensity}
        color={sun.color}
      />
    </>
  );
}

/**
 * Everything that lives inside the R3F Canvas.
 * Keep this tree free of HTML — overlays belong in GlobeCanvas.
 */
export function GlobeScene({ onGlobeReady }: GlobeSceneProps) {
  const interactionRef = useGlobeInteraction();

  return (
    <>
      <color attach="background" args={[GLOBE_BACKGROUND]} />
      <AdaptiveDpr pixelated={false} />

      <GlobeLighting />
      <Stars
        radius={90}
        depth={40}
        count={4500}
        factor={3.2}
        saturation={0}
        fade
        speed={0.35}
      />

      <Earth interactionRef={interactionRef} onReady={onGlobeReady}>
        <CountryLayer />
        <group name="layer-markers" visible={false} />
        <group name="layer-data" visible={false} />
      </Earth>

      <CameraControls interactionRef={interactionRef} />
      <CameraAnimator />
      <GlobeEffects />
    </>
  );
}
