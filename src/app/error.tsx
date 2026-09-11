"use client";

interface ErrorPageProps {
  reset: () => void;
}

export default function Error({ reset }: ErrorPageProps) {
  return (
    <div className="flex h-dvh items-center justify-center bg-[#020617] px-6 text-center">
      <div>
        <p className="max-w-sm text-sm text-slate-300">
          Unable to initialize the 3D globe. Check that WebGL is enabled in this
          browser, then try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 text-xs tracking-wide text-sky-300 underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
