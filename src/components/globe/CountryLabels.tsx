"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
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
  if (rank < 8) return 0.108;
  if (rank < 22) return 0.078;
  if (rank < 55) return 0.054;
  return 0.04;
}

function CountryLabel({ anchor }: { anchor: CountryLabelAnchor }) {
  const groupRef = useRef<Group>(null);

  useFrame(({ camera }) => {
    const group = groupRef.current;
    if (!group) return;

    group.getWorldPosition(worldPos);
    worldPos.normalize();
    cameraDir.copy(camera.position).normalize();
    // Hide edge-on text at the limb so names do not flatten into floating slivers.
    group.visible = worldPos.dot(cameraDir) > COUNTRY_LABELS.facingDot;
  });

  return (
    <group ref={groupRef} position={anchor.position} quaternion={anchor.quaternion}>
      <Text
        fontSize={fontSizeForRank(anchor.rank)}
        color="#f8fafc"
        outlineWidth={0.018}
        outlineColor="#020617"
        outlineOpacity={0.9}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        maxWidth={0.85}
        overflowWrap="break-word"
        letterSpacing={0.02}
        depthOffset={-4}
        renderOrder={3}
        raycast={() => {}}
      >
        {anchor.name}
      </Text>
    </group>
  );
}

/**
 * Country names as 3D glyphs on the sphere surface.
 * They inherit Earth's rotation and are occluded on the far side.
 */
export function CountryLabels({
  countries,
}: {
  countries: readonly CountryRecord[];
}) {
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
