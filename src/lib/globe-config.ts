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
  facingDot: 0.32,
  farDistance: 5.05,
  midDistance: 3.55,
  farCount: 22,
  midCount: 55,
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
