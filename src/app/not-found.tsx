import Link from "next/link";
import { ArrowRight, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NorthstarLogo } from "@/components/brand/logo";

/**
 * Lost-in-space 404. Renders without the auth'd app shell on purpose — the
 * user might have hit a typo, so we show a calm, branded "let's get you back"
 * moment instead of a raw 404.
 */
export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="absolute inset-0 bg-aurora opacity-70" />
      <div aria-hidden className="absolute inset-0 bg-star-field opacity-90" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/">
          <NorthstarLogo />
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm">
            <Home className="h-3.5 w-3.5" /> Home
          </Button>
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center">
        {/* Constellation graphic — a little wayward star trying to find the path. */}
        <svg
          viewBox="0 0 400 200"
          className="mb-10 h-48 w-full max-w-lg opacity-90"
          aria-hidden
        >
          <defs>
            <linearGradient id="line-grad" x1="0" x2="1">
              <stop offset="0%" stopColor="#3d66ff" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.8} />
            </linearGradient>
            <radialGradient id="glow-404" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#608bff" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#608bff" stopOpacity={0} />
            </radialGradient>
          </defs>
          <path d="M 30 140 Q 100 80 170 120 T 320 100" stroke="url(#line-grad)" strokeWidth={2.4} strokeDasharray="5 6" fill="none" />
          {[
            { x: 30, y: 140 },
            { x: 100, y: 90 },
            { x: 170, y: 120 },
            { x: 240, y: 95 },
          ].map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={14} fill="url(#glow-404)" />
              <circle cx={p.x} cy={p.y} r={6} fill="#3d66ff" stroke="white" strokeWidth={2} />
            </g>
          ))}
          {/* Wayward star — our lost 404 */}
          <g className="animate-pulse-glow">
            <circle cx={370} cy={60} r={22} fill="url(#glow-404)" />
            <path
              d="M 370 44 l 4 11 11 1 -9 7 3 11 -9 -6 -9 6 3 -11 -9 -7 11 -1 z"
              fill="#f6c768"
              stroke="white"
              strokeWidth={1}
            />
          </g>
          <text x={330} y={30} className="fill-muted-foreground" style={{ fontSize: 10, fontWeight: 600 }}>
            you are here
          </text>
        </svg>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-northstar-400/40 bg-northstar-500/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-northstar-700 dark:text-northstar-200">
          <Compass className="h-3 w-3" /> Off the map
        </div>
        <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          404 · This page wandered off
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          The route you followed doesn&apos;t lead anywhere yet. Let&apos;s navigate you back to the journey.
        </p>
        <div className="mt-8 flex items-center gap-2">
          <Button asChild>
            <Link href="/">
              Take me home <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
