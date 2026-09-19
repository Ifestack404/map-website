"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Object3D, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CAMERA_FOCUS } from "@/lib/globe-config";
import {
  easeInOutCubic,
  getCountryCameraPose,
  getCountryCenterLatLng,
  getIdleCameraPose,
} from "@/lib/geography/camera-focus";
import { getCountryById } from "@/data/world";
import { useSelectedCountry } from "@/hooks/useCountryInteraction";

interface AnimState {
  active: boolean;
  start: number;
  duration: number;
  fromPos: Vector3;
  toPosLocal: Vector3;
  fromTarget: Vector3;
  toTargetLocal: Vector3;
  earth: Object3D | null;
}

/**
 * Smoothly eases the camera toward a selected country (or back to idle).
 * Destinations are computed in Earth-local space, then transformed with the
 * Earth group's matrix so geographic focus stays correct while the planet spins.
 */
export function CameraAnimator() {
  const { camera, scene, controls } = useThree();
  const selectedCountry = useSelectedCountry();
  const anim = useRef<AnimState>({
    active: false,
    start: 0,
    duration: CAMERA_FOCUS.focusDurationMs,
    fromPos: new Vector3(),
    toPosLocal: new Vector3(),
    fromTarget: new Vector3(),
    toTargetLocal: new Vector3(),
    earth: null,
  });

  const scratch = useMemo(
    () => ({
      pos: new Vector3(),
      target: new Vector3(),
      worldPos: new Vector3(),
      worldTarget: new Vector3(),
    }),
    [],
  );

  const selectionKey = selectedCountry?.id ?? null;

  useEffect(() => {
    const earth = scene.getObjectByName("earth-root");
    const orbit = controls as OrbitControlsImpl | null;
    const isMobile =
      typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let pose = getIdleCameraPose();
    if (selectedCountry) {
      const record = getCountryById(selectedCountry.id);
      if (record) {
        const center = getCountryCenterLatLng(record);
        pose = getCountryCameraPose(center.lat, center.lng, { isMobile });
      }
    }

    const toPosLocal = pose.localPosition.clone();
    const toTargetLocal = pose.localTarget.clone();

    const applyInstant = () => {
      if (earth) {
        earth.updateWorldMatrix(true, false);
        scratch.worldPos.copy(toPosLocal);
        scratch.worldTarget.copy(toTargetLocal);
        earth.localToWorld(scratch.worldPos);
        earth.localToWorld(scratch.worldTarget);
        camera.position.copy(scratch.worldPos);
        if (orbit) {
          orbit.target.copy(scratch.worldTarget);
          orbit.update();
        }
      } else {
        camera.position.copy(toPosLocal);
        if (orbit) {
          orbit.target.copy(toTargetLocal);
          orbit.update();
        }
      }
      anim.current.active = false;
    };

    if (prefersReduced) {
      applyInstant();
      return;
    }

    anim.current = {
      active: true,
      start: performance.now(),
      duration: selectedCountry
        ? CAMERA_FOCUS.focusDurationMs
        : CAMERA_FOCUS.returnDurationMs,
      fromPos: camera.position.clone(),
      toPosLocal,
      fromTarget: orbit?.target.clone() ?? new Vector3(0, 0, 0),
      toTargetLocal,
      earth: earth ?? null,
    };

    if (orbit) orbit.enabled = false;

    return () => {
      if (orbit) orbit.enabled = true;
    };
  }, [selectionKey, selectedCountry, camera, controls, scene, scratch]);

  useFrame((_, delta) => {
    const state = anim.current;
    if (!state.active) return;

    const orbit = controls as OrbitControlsImpl | null;
    const earth = state.earth ?? scene.getObjectByName("earth-root");
    if (earth) earth.updateWorldMatrix(true, false);

    const elapsed = performance.now() - state.start;
    const t = Math.min(1, elapsed / state.duration);
    const eased = easeInOutCubic(t);

    scratch.worldPos.copy(state.toPosLocal);
    scratch.worldTarget.copy(state.toTargetLocal);
    if (earth) {
      earth.localToWorld(scratch.worldPos);
      earth.localToWorld(scratch.worldTarget);
    }

    scratch.pos.lerpVectors(state.fromPos, scratch.worldPos, eased);
    scratch.target.lerpVectors(state.fromTarget, scratch.worldTarget, eased);

    const damp = 1 - Math.exp(-CAMERA_FOCUS.damping * Math.max(delta, 0.001));
    camera.position.lerp(scratch.pos, damp);

    if (orbit) {
      orbit.target.lerp(scratch.target, damp);
      orbit.update();
    } else {
      camera.lookAt(scratch.target);
    }

    if (t >= 1) {
      camera.position.copy(scratch.worldPos);
      if (orbit) {
        orbit.target.copy(scratch.worldTarget);
        orbit.enabled = true;
        orbit.update();
      }
      state.active = false;
    }
  });

  return null;
}
