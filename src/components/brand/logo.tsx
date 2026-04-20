import { cn } from "@/lib/utils";

export function NorthstarLogo({
  className,
  withText = true,
  size = 28,
}: {
  className?: string;
  withText?: boolean;
  size?: number;
}) {
  return (
    <span className={cn("group inline-flex items-center gap-2", className)}>
      <span
        className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-northstar-500 via-northstar-600 to-northstar-800 text-white shadow-lg shadow-northstar-500/30 transition-transform group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[70%] w-[70%]"
          aria-hidden
        >
          <path
            d="M12 2.5l2.2 6.2 6.3.4-4.9 3.9 1.7 6.1L12 15.7l-5.3 3.4 1.7-6.1-4.9-3.9 6.3-.4L12 2.5z"
            fill="currentColor"
            className="text-white"
          />
          {/* Tiny twinkle accents — animate with the Tailwind `pulse-glow` keyframe. */}
          <circle cx={19} cy={5} r={1} className="animate-pulse-glow fill-white/90" style={{ animationDelay: "0.2s" }} />
          <circle cx={5} cy={7} r={0.6} className="animate-pulse-glow fill-white/80" style={{ animationDelay: "1s" }} />
          <circle cx={7} cy={19} r={0.6} className="animate-pulse-glow fill-white/75" style={{ animationDelay: "1.6s" }} />
        </svg>
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-northstar-400/60 to-transparent blur-md"
        />
        <span
          aria-hidden
          className="absolute -inset-1 -z-20 rounded-2xl bg-gradient-to-br from-northstar-500/0 to-northstar-400/40 opacity-0 blur-xl transition-opacity group-hover:opacity-80"
        />
      </span>
      {withText && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Northstar <span className="text-muted-foreground font-normal">LXP</span>
        </span>
      )}
    </span>
  );
}
