"use client";

interface GlobeLoaderProps {
  progress: number;
  fading?: boolean;
}

/**
 * Full-viewport overlay shown until Earth textures are on the GPU.
 */
export function GlobeLoader({ progress, fading = false }: GlobeLoaderProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center bg-[#020617] transition-opacity duration-500 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label={`Loading globe, ${clamped} percent`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-28 w-28">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-200 ease-out"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-sm text-sky-100/90">
            {clamped}%
          </span>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium tracking-[0.22em] text-slate-100 uppercase">
            Loading Earth
          </p>
          <p className="mt-2 text-xs tracking-wide text-slate-400">
            Preparing the 3D globe
          </p>
        </div>
      </div>
    </div>
  );
}
