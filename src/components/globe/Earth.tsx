"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  AdditiveBlending,
  BackSide,
  Color,
  Group,
  SRGBColorSpace,
} from "three";
import {
  EARTH_RADIUS,
  EARTH_ROTATION_RESUME_MS,
  EARTH_ROTATION_SPEED,
  EARTH_SEGMENTS,
  EARTH_TEXTURES,
} from "@/lib/globe-config";
import type { EarthProps } from "@/types/globe";
import { useSelectedCountry } from "@/hooks/useCountryInteraction";

const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;

  void main() {
    // View-space normal is used to draw a camera-facing Fresnel rim.
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = /* glsl */ `
  varying vec3 vNormal;
  uniform vec3 uColor;

  void main() {
    float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
    gl_FragColor = vec4(uColor, 1.0) * intensity;
  }
`;

function Atmosphere() {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color("#7ec8ff") },
    }),
    [],
  );

  return (
    <mesh scale={1.08} renderOrder={-1}>
      <sphereGeometry args={[EARTH_RADIUS, EARTH_SEGMENTS, EARTH_SEGMENTS]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        side={BackSide}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Textured, slowly rotating Earth.
 *
 * Geographic overlays (borders, markers, data) MUST be passed as `children`
 * of this component. They inherit the group's Y-rotation, so a city at
 * (lat, lng) stays pinned to its texture pixel while the planet spins.
 */
export function Earth({ interactionRef, children, onReady }: EarthProps) {
  const groupRef = useRef<Group>(null);
  const { gl } = useThree();
  const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const selectedCountry = useSelectedCountry();

  const [colorMap, bumpMap] = useTexture([
    EARTH_TEXTURES.day,
    EARTH_TEXTURES.bump,
  ]);

  useLayoutEffect(() => {
    onReady?.();
  }, [onReady]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // Freeze idle spin while a country is focused so camera math stays locked.
    if (selectedCountry) return;

    const { isInteracting, lastActivityAt } = interactionRef.current;
    const idle =
      !isInteracting &&
      performance.now() - lastActivityAt > EARTH_ROTATION_RESUME_MS;

    if (idle) {
      group.rotation.y += delta * EARTH_ROTATION_SPEED;
    }
  });

  return (
    <group ref={groupRef} name="earth-root">
      <mesh name="earth-surface" castShadow={false} receiveShadow={false}>
        {/* Stage 3: raycast this mesh, then cartesianToLatLng() to resolve a country. */}
        <sphereGeometry args={[EARTH_RADIUS, EARTH_SEGMENTS, EARTH_SEGMENTS]} />
        <meshStandardMaterial
          map={colorMap}
          // Color maps are authored in sRGB; bump maps stay linear (data, not color).
          map-colorSpace={SRGBColorSpace}
          map-anisotropy={anisotropy}
          bumpMap={bumpMap}
          bumpMap-anisotropy={anisotropy}
          bumpScale={0.045}
          roughness={0.74}
          metalness={0.06}
          // Soft fill so the night side remains readable without a night-lights map.
          emissive="#041018"
          emissiveIntensity={0.18}
        />
      </mesh>

      <Atmosphere />

      {/* Stage 2+ mount point: boundaries, markers, and data layers. */}
      {children}
    </group>
  );
}
