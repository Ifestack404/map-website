import { MathUtils } from "three";

/** World-space radius of the Earth mesh. All geo projections should use this value. */
export const EARTH_RADIUS = 1.6;

/**
 * Sphere tessellation. 64 is a balance between a round limb and GPU cost.
 * Country borders will be line overlays, so we do not need extreme subdivision.
 */
export const EARTH_SEGMENTS = 64;

/** Radians per second for idle spin. ~0.04 ≈ one revolution every 2.5 minutes. */
export const EARTH_ROTATION_SPEED = 0.04;

/** Resume idle spin this many ms after the user last dragged or zoomed. */
export const EARTH_ROTATION_RESUME_MS = 1600;

/**
 * Equirectangular color / bump maps in /public.
 * Color map: NASA Blue Marble style imagery (via three-globe example assets).
 * Bump map: grayscale topology used to fake terrain relief under lighting.
 */
export const EARTH_TEXTURES = {
  day: "/textures/earth/earth-day.jpg",
  bump: "/textures/earth/earth-topology.png",
} as const;

export const GLOBE_CAMERA = {
  position: [0, 0.35, 4.35] as const,
  fov: 42,
  near: 0.1,
  far: 200,
};

export const GLOBE_CONTROLS = {
  dampingFactor: 0.075,
  rotateSpeed: 0.45,
  zoomSpeed: 0.72,
  /** Prevent clipping into the mesh. */
  minDistance: EARTH_RADIUS * 1.35,
  /** Keep the globe framed; far enough to read it as a planet in space. */
  maxDistance: EARTH_RADIUS * 5.2,
  /**
   * Avoid exact poles where OrbitControls gimbal-locks.
   * Users can still inspect the Arctic / Antarctic.
   */
  minPolarAngle: MathUtils.degToRad(8),
  maxPolarAngle: MathUtils.degToRad(172),
};

export const GLOBE_BACKGROUND = "#020617";

export const GLOBE_LIGHTING = {
  ambient: { intensity: 0.28, color: "#9bbcff" },
  sun: {
    position: [7.5, 2.4, 4.8] as const,
    intensity: 2.35,
    color: "#fff4e0",
  },
  hemisphere: {
    sky: "#b9d7ff",
    ground: "#071018",
    intensity: 0.32,
  },
} as const;

/**
 * Border stroke radius as a scale of `EARTH_RADIUS`.
 * Slightly outside the textured mesh so lines do not z-fight with terrain.
 */
export const COUNTRY_BORDER_RADIUS_SCALE = 1.008;

export const COUNTRY_BORDERS = {
  color: "#d7e6f4",
  opacity: 0.5,
  /** Max angle between consecutive samples so strokes follow globe curvature. */
  maxStepRadians: MathUtils.degToRad(1.75),
} as const;

/**
 * Label anchors sit a little further out than borders so names are not clipped.
 */
export const COUNTRY_LABEL_RADIUS_SCALE = 1.012;

export const COUNTRY_LABELS = {
  facingDot: 0.38,
  farDistance: 5.05,
  midDistance: 3.55,
  farCount: 14,
  midCount: 32,
  /** Minimum angular separation between labels, by zoom tier. */
  farMinAngle: 0.34,
  midMinAngle: 0.2,
  closeMinAngle: 0.11,
} as const;

/** Highlight fill sits between the Earth mesh and the border strokes. */
export const COUNTRY_HIGHLIGHT_RADIUS_SCALE = 1.004;

export const COUNTRY_HIGHLIGHT = {
  hoverColor: "#7dd3fc",
  hoverOpacity: 0.32,
  selectedColor: "#38bdf8",
  selectedOpacity: 0.48,
  maxStepRadians: MathUtils.degToRad(2.2),
} as const;

export function getGlobeRadius(): number {
  return EARTH_RADIUS;
}

export function getCountryBorderRadius(): number {
  return EARTH_RADIUS * COUNTRY_BORDER_RADIUS_SCALE;
}

export function getCountryLabelRadius(): number {
  return EARTH_RADIUS * COUNTRY_LABEL_RADIUS_SCALE;
}

export function getCountryHighlightRadius(): number {
  return EARTH_RADIUS * COUNTRY_HIGHLIGHT_RADIUS_SCALE;
}

/** Stage 6 — cinematic country focus camera. */
export const CAMERA_FOCUS = {
  /** Idle framing distance from globe center. */
  idleDistance: GLOBE_CAMERA.position[2],
  /** Closer orbit when a country is selected (desktop). */
  focusDistance: EARTH_RADIUS * 2.15,
  /** Slightly farther on small screens for usable touch orbit. */
  mobileFocusDistance: EARTH_RADIUS * 2.55,
  focusDurationMs: 1400,
  returnDurationMs: 1100,
  /** Exponential damping toward the eased path (higher = snappier). */
  damping: 4.2,
} as const;

export const COUNTRY_GLOW = {
  color: "#5eead4",
  fillOpacity: 0.14,
  borderOpacity: 0.72,
  radiusScale: 1.006,
} as const;
