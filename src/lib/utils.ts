import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  input: string | number | Date,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
) {
  return new Date(input).toLocaleDateString("en-US", opts);
}

export function relativeDate(input: string | Date) {
  const date = new Date(input).getTime();
  const now = Date.now();
  const diff = date - now;
  const day = 1000 * 60 * 60 * 24;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < day) return rtf.format(Math.round(diff / (1000 * 60 * 60)), "hour");
  if (abs < day * 30) return rtf.format(Math.round(diff / day), "day");
  if (abs < day * 365) return rtf.format(Math.round(diff / (day * 30)), "month");
  return rtf.format(Math.round(diff / (day * 365)), "year");
}

export function formatPct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function pickColor(seed: string) {
  const palette = [
    "bg-sky-500/20 text-sky-700 dark:text-sky-300",
    "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    "bg-violet-500/20 text-violet-700 dark:text-violet-300",
    "bg-rose-500/20 text-rose-700 dark:text-rose-300",
    "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
    "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
    "bg-lime-500/20 text-lime-700 dark:text-lime-300",
  ];
  return palette[hashString(seed) % palette.length];
}
