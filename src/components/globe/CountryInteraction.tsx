"use client";

import { useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { EARTH_RADIUS, EARTH_SEGMENTS } from "@/lib/globe-config";
import { cartesianToLatLng } from "@/lib/geography/coordinates";
import { findCountryAtLatLng } from "@/lib/geography/lookup";
import { pointerGesture } from "@/state/countrySelection";
import { useCountryInteraction } from "@/hooks/useCountryInteraction";
import { CountryHighlight } from "./CountryHighlight";
import { CountryFocus } from "./CountryFocus";
import { CountryGlow } from "./CountryGlow";
import type { CountryRef } from "@/types/geography";

const TAP_MOUSE_PX = 8;
const TAP_TOUCH_PX = 18;

function latLngFromPointer(event: ThreeEvent<PointerEvent>): { lat: number; lng: number } | null {
  if (event.uv) {
    return {
      lng: event.uv.x * 360 - 180,
      lat: event.uv.y * 180 - 90,
    };
  }

  const local = event.object.worldToLocal(event.point.clone());
  return cartesianToLatLng(local.x, local.y, local.z);
}

function countryFromPointer(event: ThreeEvent<PointerEvent>): CountryRef | null {
  const coords = latLngFromPointer(event);
  if (!coords) return null;
  return findCountryAtLatLng(coords.lat, coords.lng);
}

function isTap(event: ThreeEvent<PointerEvent>): boolean {
  const dx = event.clientX - pointerGesture.x;
  const dy = event.clientY - pointerGesture.y;
  const threshold = event.pointerType === "touch" ? TAP_TOUCH_PX : TAP_MOUSE_PX;
  return Math.hypot(dx, dy) < threshold && !pointerGesture.moved;
}

/**
 * Picking sphere + hover/selected fills.
 * Geometry for a country is created once, on first highlight — never on every move.
 */
export function CountryInteraction() {
  const { hoveredCountry, selectedCountry, hoverCountry, selectCountry, clearSelection } =
    useCountryInteraction();
  const cursor = useRef<HTMLCanvasElement | null>(null);

  const setCursor = (value: string) => {
    const canvas = cursor.current;
    if (canvas) canvas.style.cursor = value;
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    cursor.current = event.nativeEvent.target as HTMLCanvasElement | null;

    const dx = event.clientX - pointerGesture.x;
    const dy = event.clientY - pointerGesture.y;
    const threshold = event.pointerType === "touch" ? TAP_TOUCH_PX : TAP_MOUSE_PX;
    if (event.buttons > 0 && Math.hypot(dx, dy) >= threshold) {
      pointerGesture.moved = true;
    }

    const country = countryFromPointer(event);
    hoverCountry(country);
    setCursor(country ? "pointer" : "default");
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    pointerGesture.x = event.clientX;
    pointerGesture.y = event.clientY;
    pointerGesture.moved = false;
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!isTap(event)) return;

    const country = countryFromPointer(event);
    if (country) {
      selectCountry(country);
      return;
    }

    clearSelection();
  };

  const handlePointerOut = () => {
    hoverCountry(null);
    setCursor("default");
  };

  return (
    <group name="country-interaction">
      {selectedCountry ? (
        <>
          <CountryGlow country={selectedCountry} />
          <CountryFocus country={selectedCountry} />
        </>
      ) : null}
      {hoveredCountry && hoveredCountry.id !== selectedCountry?.id ? (
        <CountryHighlight country={hoveredCountry} variant="hover" />
      ) : null}

      <mesh
        name="country-pick-sphere"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[EARTH_RADIUS * 1.001, EARTH_SEGMENTS, EARTH_SEGMENTS]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>
    </group>
  );
}
