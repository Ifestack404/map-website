"use client";

import { OrbitControls } from "@react-three/drei";
import { GLOBE_CONTROLS } from "@/lib/globe-config";
import type { CameraControlsProps } from "@/types/globe";

function markActivity(
  interactionRef: CameraControlsProps["interactionRef"],
  isInteracting: boolean,
) {
  interactionRef.current.isInteracting = isInteracting;
  interactionRef.current.lastActivityAt = performance.now();
}

/**
 * Camera rig around the globe.
 *
 * We orbit the camera (not the mesh) so geographic coordinates stay stable in
 * world space while the user inspects a region. Pan is disabled — sliding the
 * focal point off-planet looks broken on a sphere.
 *
 * `makeDefault` registers this control with R3F so Stage 2 can tween the camera
 * toward a lat/lng without a new controls instance.
 */
export function CameraControls({ interactionRef }: CameraControlsProps) {
  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={GLOBE_CONTROLS.dampingFactor}
      enablePan={false}
      enableRotate
      enableZoom
      rotateSpeed={GLOBE_CONTROLS.rotateSpeed}
      zoomSpeed={GLOBE_CONTROLS.zoomSpeed}
      minDistance={GLOBE_CONTROLS.minDistance}
      maxDistance={GLOBE_CONTROLS.maxDistance}
      minPolarAngle={GLOBE_CONTROLS.minPolarAngle}
      maxPolarAngle={GLOBE_CONTROLS.maxPolarAngle}
      target={[0, 0, 0]}
      onStart={() => markActivity(interactionRef, true)}
      onEnd={() => markActivity(interactionRef, false)}
    />
  );
}
