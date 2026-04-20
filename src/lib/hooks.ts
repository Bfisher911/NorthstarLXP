"use client";

import * as React from "react";

/** Detects the user's `prefers-reduced-motion` setting and keeps it fresh. */
export function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

/**
 * Smoothly counts from 0 (or a supplied start) to a target number. Respects
 * reduced motion by returning the final value immediately.
 */
export function useCountUp(target: number, options: { durationMs?: number; start?: number } = {}) {
  const { durationMs = 900, start = 0 } = options;
  const reduced = useReducedMotion();
  const [value, setValue] = React.useState(reduced ? target : start);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const from = value;
    const change = target - from;
    if (change === 0) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + change * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // Only re-animate when target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reduced, durationMs]);

  return value;
}

/**
 * Observes an element with IntersectionObserver and returns true once it has
 * entered the viewport. Used to trigger on-scroll animations (progress fills,
 * number count-ups) only when the element is visible.
 */
export function useInView<T extends Element = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.2 }
) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
          break;
        }
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, [options]);

  return { ref, inView } as const;
}

/** Binds a keyboard shortcut. Pass `mod: true` for Cmd/Ctrl chord. */
export function useKeyboardShortcut(
  key: string,
  handler: (e: KeyboardEvent) => void,
  { mod = false }: { mod?: boolean } = {}
) {
  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (mod && !(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        handler(e);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [key, handler, mod]);
}
