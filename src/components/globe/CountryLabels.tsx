"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Group, Vector3 } from "three";
import { COUNTRY_LABELS } from "@/lib/globe-config";
import {
  getCountryLabelAnchors,
  spaceCountryLabels,
} from "@/lib/geography/labels";
import type { CountryLabelAnchor, CountryRecord } from "@/types/geography";

const worldPos = new Vector3();
const cameraDir = new Vector3();

function labelLimit(distance: number): {
  count: number;
  minAngle: number;
} {
  if (distance > COUNTRY_LABELS.farDistance) {
    return { count: COUNTRY_LABELS.farCount, minAngle: COUNTRY_LABELS.farMinAngle };
  }
  if (distance > COUNTRY_LABELS.midDistance) {
    return { count: COUNTRY_LABELS.midCount, minAngle: COUNTRY_LABELS.midMinAngle };
  }
  return { count: Number.POSITIVE_INFINITY, minAngle: COUNTRY_LABELS.closeMinAngle };
}

function fontSizeForRank(rank: number): number {
  if (rank < 8) return 0.09;
  if (rank < 18) return 0.062;
  if (rank < 32) return 0.048;
  return 0.038;
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
    <group ref={groupRef} position={anchor.position} quaternion={anchor.quaternion}>
      <Text
        fontSize={fontSizeForRank(anchor.rank)}
        color="#f8fafc"
        outlineWidth={0.02}
        outlineColor="#020617"
        outlineOpacity={0.92}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        maxWidth={1.15}
        overflowWrap="break-word"
        letterSpacing={0.12}
        lineHeight={1.45}
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
 * Nearby names are culled so labels do not sit on top of each other.
 */
export function CountryLabels({
  countries,
}: {
  countries: readonly CountryRecord[];
}) {
  const anchors = useMemo(() => getCountryLabelAnchors(countries), [countries]);
  const [tier, setTier] = useState(() => labelLimit(4.35));
  const tierRef = useRef(tier);

  useFrame(({ camera }) => {
    const next = labelLimit(camera.position.length());
    if (
      next.count !== tierRef.current.count ||
      next.minAngle !== tierRef.current.minAngle
    ) {
      tierRef.current = next;
      setTier(next);
    }
  });

  const visible = useMemo(
    () => spaceCountryLabels(anchors, tier.minAngle, tier.count),
    [anchors, tier],
  );

  return (
    <group name="country-labels">
      {visible.map((anchor) => (
        <CountryLabel key={anchor.id} anchor={anchor} />
      ))}
    </group>
  );
}
