/**
 * Curated gradient + emoji presets for the course thumbnail picker. The
 * gradient strings must match Tailwind's `bg-gradient-to-br ${x}` syntax
 * used throughout the app (the course card, the hero, the thumbnail art).
 */

export const GRADIENT_PRESETS: Array<{ label: string; className: string }> = [
  { label: "Northstar", className: "from-northstar-500/90 to-indigo-600/90" },
  { label: "Emerald / Sky", className: "from-emerald-500/90 to-sky-600/90" },
  { label: "Rose / Orange", className: "from-rose-500/90 to-orange-500/90" },
  { label: "Amber / Red", className: "from-amber-500/90 to-red-600/90" },
  { label: "Amber / Orange", className: "from-amber-500/90 to-orange-600/90" },
  { label: "Teal / Cyan", className: "from-teal-500/90 to-cyan-600/90" },
  { label: "Cyan / Blue", className: "from-cyan-500/90 to-blue-600/90" },
  { label: "Cyan / Deep blue", className: "from-cyan-500/90 to-blue-700/90" },
  { label: "Sky / Indigo", className: "from-sky-500/90 to-indigo-600/90" },
  { label: "Indigo / Violet", className: "from-indigo-500/90 to-violet-600/90" },
  { label: "Violet / Fuchsia", className: "from-violet-500/90 to-fuchsia-600/90" },
  { label: "Violet / Indigo", className: "from-violet-500/90 to-indigo-700/90" },
  { label: "Red / Amber", className: "from-red-500/90 to-amber-500/90" },
  { label: "Emerald / Lime", className: "from-emerald-500/90 to-lime-600/90" },
];

export const EMOJI_PRESETS: string[] = [
  "🛡️", "🔐", "🩸", "🩺", "🏋️", "🧼", "🚨", "📜",
  "🧭", "📋", "🔬", "⚖️", "🏗️", "🚚", "📦", "🧪",
  "💼", "🧰", "🎓", "✨", "🎯", "📚", "🗂️", "📈",
  "🖥️", "🔧", "🏥", "🚑", "🧠", "🫀", "🌟", "🎬",
];
