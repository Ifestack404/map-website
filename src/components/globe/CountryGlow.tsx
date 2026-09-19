"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { COUNTRY_GLOW, getCountryHighlightRadius } from "@/lib/globe-config";
import { getCountryHighlightGeometry } from "@/lib/geography/country-mesh";
import { latLngToCartesianInto, type CartesianTuple } from "@/lib/geography/coordinates";
import { getCountryById } from "@/data/world";
import type { CountryRef, CountryRecord } from "@/types/geography";

interface CountryGlowProps {
  country: CountryRef;
}

const scratch: CartesianTuple = [0, 0, 0];

function buildBorderSegments(country: CountryRecord): BufferGeometry | null {
  const radius = getCountryHighlightRadius() * COUNTRY_GLOW.radiusScale;
  const positions: number[] = [];

  for (const ring of country.rings) {
    if (ring.length < 2) continue;
    const last = ring.length - 1;
    const closed =
      ring[0][0] === ring[last][0] && ring[0][1] === ring[last][1];
    const count = closed ? ring.length - 1 : ring.length;
    if (count < 2) continue;

    const verts: number[] = [];
    for (let i = 0; i < count; i++) {
      const [lng, lat] = ring[i];
      latLngToCartesianInto(lat, lng, radius, scratch);
      verts.push(scratch[0], scratch[1], scratch[2]);
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const j3 = ((i + 1) % count) * 3;
      positions.push(
        verts[i3],
        verts[i3 + 1],
        verts[i3 + 2],
        verts[j3],
        verts[j3 + 1],
        verts[j3 + 2],
      );
    }
  }

  if (positions.length === 0) return null;
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geo;
}

/**
 * Subtle additive glow + animated border for the selected country.
 * Geometries memoized per country id — never rebuilt every frame.
 */
export function CountryGlow({ country }: CountryGlowProps) {
  const glowRef = useRef<Mesh>(null);
  const borderRef = useRef<LineSegments>(null);
  const glowMat = useRef<MeshBasicMaterial>(null);
  const borderMat = useRef<LineBasicMaterial>(null);

  const geometries = useMemo(() => {
    const record = getCountryById(country.id);
    if (!record) return null;
    return {
      fill: getCountryHighlightGeometry(record),
      border: buildBorderSegments(record),
    };
  }, [country.id]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (glowMat.current) {
      glowMat.current.opacity =
        COUNTRY_GLOW.fillOpacity + Math.sin(t * 1.5) * 0.035;
    }
    if (borderMat.current) {
      borderMat.current.opacity =
        COUNTRY_GLOW.borderOpacity + Math.sin(t * 3.2) * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.008 + Math.sin(t * 1.5) * 0.004);
    }
  });

  if (!geometries?.fill) return null;

  return (
    <group name={`country-glow-${country.id}`}>
      <mesh
        ref={glowRef}
        geometry={geometries.fill}
        renderOrder={1}
        raycast={() => {}}
      >
        <meshBasicMaterial
          ref={glowMat}
          color={COUNTRY_GLOW.color}
          transparent
          opacity={COUNTRY_GLOW.fillOpacity}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {geometries.border ? (
        <lineSegments
          ref={borderRef}
          geometry={geometries.border}
          renderOrder={3}
          raycast={() => {}}
        >
          <lineBasicMaterial
            ref={borderMat}
            color="#ccfbf1"
            transparent
            opacity={COUNTRY_GLOW.borderOpacity}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>
      ) : null}
    </group>
  );
}
