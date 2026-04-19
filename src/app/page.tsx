import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Layers,
  Map,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { NorthstarLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Map,
    title: "Visual learning journeys",
    description:
      "Design required and optional training as an interactive map — branches, prerequisites, and credentials as one connected graph.",
  },
  {
    icon: Layers,
    title: "True multi-tenant workspaces",
    description:
      "Each training office, safety unit, or compliance team runs as its own isolated mini-LMS inside your organization.",
  },
  {
    icon: BrainCircuit,
    title: "AI-assisted assignment",
    description:
      "Feed the engine a course's purpose, and Northstar proposes the right learners — with explanations and an approval queue.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance you can prove",
    description:
      "Attestations, expirations, renewals, evidence tasks, and a complete audit trail in one clean dashboard.",
  },
  {
    icon: Workflow,
    title: "Smart groups & survey triggers",
    description:
      "Rules engine and needs assessments automatically route training from answers → assignments.",
  },
  {
    icon: Network,
    title: "Org-wide path composition",
    description:
      "Org admins weave content from any workspace into a single master journey for the entire organization.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="absolute inset-0 bg-aurora" />
      <div aria-hidden className="absolute inset-0 bg-star-field opacity-70 dark:opacity-100" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <NorthstarLogo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#personas" className="hover:text-foreground">Roles</a>
          <a href="#journey" className="hover:text-foreground">Journeys</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/sign-in">
            <Button size="sm">
              Try the demo
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-8 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Badge variant="outline" className="mb-6 border-northstar-500/40 bg-northstar-500/10 text-northstar-700 dark:text-northstar-200">
              <Sparkles className="h-3 w-3" /> The learning platform with a sense of direction
            </Badge>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl">
              Training that feels like a{" "}
              <span className="bg-gradient-to-br from-northstar-500 via-northstar-400 to-constellation-nova bg-clip-text text-transparent">
                journey
              </span>
              , not a spreadsheet.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
              Northstar LXP is a modern, multi-tenant learning experience platform for
              employee training, compliance, and credential management. Built for healthcare,
              higher education, and safety-critical organizations that deserve better than a legacy LMS.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/sign-in">
                <Button size="lg">
                  Explore the demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#personas">
                <Button size="lg" variant="outline">
                  See it by role
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> SOC 2 ready</span>
              <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> HIPAA compatible</span>
              <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> SCORM & AICC</span>
              <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> Impersonation & audit</span>
            </div>
          </div>

          <HeroJourneyArt />
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Platform
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything a serious training program needs, nothing it doesn't.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="personas" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-2xl border bg-gradient-to-br from-card to-card/60 p-8 sm:p-10">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Jump into the demo
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            One product, five perfectly-scoped experiences.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Super admins, org admins, workspace admins, managers, and learners each get an
            interface shaped around what they actually do. Sign in as any persona.
          </p>
          <div className="mt-6">
            <Link href="/sign-in">
              <Button size="lg">
                Pick a persona <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t bg-background/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <NorthstarLogo />
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Northstar LXP · Demo build
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroJourneyArt() {
  const nodes = [
    { cx: 60, cy: 100, label: "Kickoff", kind: "check" },
    { cx: 180, cy: 70, label: "HIPAA", kind: "course" },
    { cx: 180, cy: 150, label: "Needs Assessment", kind: "survey" },
    { cx: 300, cy: 60, label: "Infection Ctrl", kind: "course" },
    { cx: 300, cy: 150, label: "Bloodborne", kind: "course" },
    { cx: 300, cy: 230, label: "Back Safety", kind: "course" },
    { cx: 420, cy: 110, label: "Attestation", kind: "policy" },
    { cx: 420, cy: 210, label: "Fire Safety", kind: "course" },
    { cx: 540, cy: 160, label: "Credential", kind: "credential" },
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [2, 4], [2, 5], [3, 6], [4, 6], [5, 7], [6, 8], [7, 8],
  ];
  const color = (k: string) =>
    k === "course"
      ? "#3d66ff"
      : k === "survey"
      ? "#34d399"
      : k === "policy"
      ? "#a78bfa"
      : k === "credential"
      ? "#f6c768"
      : "#94a3b8";

  return (
    <div className="relative rounded-3xl border bg-gradient-to-br from-card via-card/80 to-card p-4 shadow-xl shadow-northstar-500/10">
      <div className="rounded-2xl border bg-background/80 p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Clinical New Hire Journey
          </span>
          <span>12 of 18 steps · 68% complete</span>
        </div>
        <svg viewBox="0 0 600 290" className="w-full">
          <defs>
            <linearGradient id="path-grad" x1="0" x2="1">
              <stop offset="0%" stopColor="#3d66ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.8" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#608bff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#608bff" stopOpacity="0" />
            </radialGradient>
          </defs>
          {edges.map(([a, b], i) => {
            const n1 = nodes[a];
            const n2 = nodes[b];
            const midX = (n1.cx + n2.cx) / 2;
            return (
              <path
                key={i}
                d={`M ${n1.cx} ${n1.cy} C ${midX} ${n1.cy}, ${midX} ${n2.cy}, ${n2.cx} ${n2.cy}`}
                stroke="url(#path-grad)"
                strokeWidth={i < 4 ? 2.5 : 1.6}
                strokeDasharray={i < 4 ? "" : "6 4"}
                strokeLinecap="round"
                fill="none"
                opacity={i < 4 ? 0.85 : 0.5}
              />
            );
          })}
          {nodes.map((n, i) => (
            <g key={i}>
              <circle cx={n.cx} cy={n.cy} r={22} fill="url(#glow)" />
              <circle
                cx={n.cx}
                cy={n.cy}
                r={14}
                fill={color(n.kind)}
                stroke="white"
                strokeWidth={2}
                className={i <= 2 ? "animate-pulse-glow" : ""}
              />
              <text
                x={n.cx}
                y={n.cy + 32}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 10, fontFamily: "var(--font-inter)", fontWeight: 600 }}
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
