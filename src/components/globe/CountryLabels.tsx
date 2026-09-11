"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Group, Vector3 } from "three";
import { COUNTRY_LABELS } from "@/lib/globe-config";
import { getCountryLabelAnchors } from "@/lib/geography/labels";
import type { CountryLabelAnchor, CountryRecord } from "@/types/geography";

const worldPos = new Vector3();
const cameraDir = new Vector3();

function labelLimit(distance: number): number {
  if (distance > COUNTRY_LABELS.farDistance) return COUNTRY_LABELS.farCount;
  if (distance > COUNTRY_LABELS.midDistance) return COUNTRY_LABELS.midCount;
  return Number.POSITIVE_INFINITY;
}

function fontSizeForRank(rank: number): number {
  if (rank < 10) return 13;
  if (rank < 28) return 11;
  return 10;
}

function CountryLabel({ anchor }: { anchor: CountryLabelAnchor }) {
  const groupRef = useRef<Group>(null);

  useFrame(({ camera }) => {
    const group = groupRef.current;
    if (!group) return;

    group.getWorldPosition(worldPos);
    worldPos.normalize();
    cameraDir.copy(camera.position).normalize();
    group.visible = worldPos.dot(cameraDir) > COUNTRY_LABELS.facingDot;
  });

  return (
    <group ref={groupRef} position={anchor.position}>
      <Html
        center
        pointerEvents="none"
        zIndexRange={[20, 0]}
        wrapperClass="country-label"
        style={{
          fontSize: `${fontSizeForRank(anchor.rank)}px`,
        }}
      >
        {anchor.name}
      </Html>
    </group>
  );
}

/**
 * Screen-space country names on the facing hemisphere.
 * Density increases as the camera dollies in so a world view stays readable.
 */
export function CountryLabels({ countries }: { countries: readonly CountryRecord[] }) {
  const anchors = useMemo(() => getCountryLabelAnchors(countries), [countries]);
  const [limit, setLimit] = useState(() => labelLimit(4.35));
  const limitRef = useRef(limit);

  useFrame(({ camera }) => {
    const next = labelLimit(camera.position.length());
    if (next !== limitRef.current) {
      limitRef.current = next;
      setLimit(next);
    }
  });

  const visible = useMemo(
    () => anchors.filter((anchor) => anchor.rank < limit),
    [anchors, limit],
  );

  return (
    <group name="country-labels">
      {visible.map((anchor) => (
        <CountryLabel key={anchor.id} anchor={anchor} />
      ))}
    </group>
  );
}
