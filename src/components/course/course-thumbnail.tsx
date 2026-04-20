import * as React from "react";
import { cn, hashString } from "@/lib/utils";

/**
 * Generative course thumbnail. Produces a unique, on-brand background for a
 * course based on a hash of its ID: a soft gradient, sprinkled constellation
 * stars, and an emoji medallion. Consistent visual identity across the app
 * without requiring a real image for every course.
 */
export function CourseThumbnail({
  id,
  gradientClass,
  emoji,
  className,
}: {
  id: string;
  /** Tailwind `from-... to-...` gradient class (e.g. "from-emerald-500/90 to-sky-600/90") */
  gradientClass: string;
  emoji: string;
  className?: string;
}) {
  const seed = hashString(id);
  // A few pseudo-random stars placed within the thumbnail. `seed` keeps it
  // stable per course (no hydration mismatches).
  const stars = Array.from({ length: 14 }, (_, i) => {
    const a = (seed + i * 131) % 100;
    const b = (seed + i * 199) % 100;
    const r = ((seed + i * 53) % 4) * 0.4 + 0.6;
    return { x: a, y: b, r };
  });

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br text-4xl text-white",
        gradientClass,
        className
      )}
      aria-hidden
    >
      {/* Soft radial sheen */}
      <div
        aria-hidden
        className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-16 -right-10 h-44 w-44 rounded-full bg-black/15 blur-3xl"
      />
      {/* Stars */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="white"
            opacity={0.35 + (s.r / 2) * 0.4}
          />
        ))}
        {/* A diagonal shooting-star line */}
        <path
          d={`M ${(seed % 20) + 8} ${(seed % 25) + 10} L ${(seed % 20) + 28} ${(seed % 25) + 16}`}
          stroke="white"
          strokeOpacity={0.5}
          strokeWidth={0.4}
          strokeLinecap="round"
        />
      </svg>
      {/* Medallion emoji */}
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-inset ring-white/30 backdrop-blur-sm">
        <span className="drop-shadow">{emoji}</span>
      </span>
    </div>
  );
}
