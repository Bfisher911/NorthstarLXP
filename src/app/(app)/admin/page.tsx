import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CloudUpload,
  Cpu,
  Database,
  HardDrive,
  Server,
  ShieldAlert,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { KpiCard } from "@/components/shell/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatRing } from "@/components/ui/stat-ring";
import { MiniTrend } from "@/components/charts/mini-trend";
import { organizations, workspaces } from "@/lib/data";
import { formatPct } from "@/lib/utils";

const trendData = [
  { label: "Wk 1", value: 82 },
  { label: "Wk 2", value: 85 },
  { label: "Wk 3", value: 84 },
  { label: "Wk 4", value: 88 },
  { label: "Wk 5", value: 86 },
  { label: "Wk 6", value: 91 },
  { label: "Wk 7", value: 89 },
  { label: "Wk 8", value: 93 },
];

export default function SuperAdminDashboard() {
  const totalSeats = organizations.reduce((s, o) => s + o.seats, 0);
  const totalActive = organizations.reduce((s, o) => s + o.activeLearners, 0);
  const avgHealth =
    organizations.reduce((s, o) => s + o.complianceHealth, 0) / organizations.length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform"
        title="Northstar LXP — platform health"
        description="Vendor view across every tenant. Everything on this page is scoped to your super admin role."
        actions={
          <>
            <Button variant="outline">
              <CloudUpload className="h-4 w-4" /> Export report
            </Button>
            <Button>
              <Building2 className="h-4 w-4" /> New organization
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Organizations"
          value={organizations.length}
          hint="All tenants"
          icon={Building2}
          accent="sky"
          delta={12}
        />
        <KpiCard
          label="Active learners"
          value={totalActive.toLocaleString()}
          hint={`${totalSeats.toLocaleString()} seats in use`}
          icon={Users}
          accent="emerald"
          delta={8}
        />
        <KpiCard
          label="Compliance health"
          value={formatPct(avgHealth)}
          hint="Weighted avg across tenants"
          icon={CheckCircle2}
          accent="violet"
          delta={4}
        />
        <KpiCard
          label="Platform uptime"
          value="99.98%"
          hint="Trailing 30 days"
          icon={Server}
          accent="cyan"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Completions across the platform</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Weekly completion rate, all tenants.</p>
            </div>
            <Badge variant="success" className="gap-1">
              <ArrowRight className="h-3 w-3 rotate-[-45deg]" /> +11% vs prior 8 weeks
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
              <div className="flex items-center justify-center">
                <StatRing value={avgHealth} size={132} stroke={12} sublabel="Platform" tone="emerald" />
              </div>
              <MiniTrend data={trendData} height={160} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" /> Flags & incidents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-amber-500/5 p-3">
              <div className="text-sm font-medium">Atlas University — compliance drift</div>
              <div className="text-xs text-muted-foreground">
                IT &amp; Security Training completion fell below 70% this week.
              </div>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <div className="text-sm font-medium">Feed sync — Northwind</div>
              <div className="text-xs text-muted-foreground">
                12 employees updated overnight. No errors.
              </div>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <div className="text-sm font-medium">Storage — Meridian</div>
              <div className="text-xs text-muted-foreground">
                182 GB of 500 GB used. Trending 18% / month.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Tenants
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
              Client organizations
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/organizations">
              Manage all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {organizations.map((org) => {
            const wsCount = workspaces.filter((w) => w.orgId === org.id).length;
            return (
              <Card key={org.id} className="group overflow-hidden card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white font-semibold shadow-sm ${accentGrad(org.accent)}`}
                    >
                      {org.logoInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold">{org.name}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {org.plan}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {org.industry} · {org.headquarters}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <Stat label="Learners" value={org.activeLearners.toLocaleString()} />
                    <Stat label="Workspaces" value={wsCount} />
                    <Stat label="Health" value={formatPct(org.complianceHealth)} />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <HardDrive className="h-3.5 w-3.5" />
                      {org.storageGb} / {org.storageQuotaGb} GB
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/org/${org.slug}`}>
                          Enter <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" /> Feed sync (last 24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Meridian" value="14,483 records · 0 errors" />
            <Row label="Atlas" value="6,512 records · 2 warnings" />
            <Row label="Northwind" value="1,802 records · 0 errors" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-4 w-4" /> AI engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Pending suggestions" value="48 (across all tenants)" />
            <Row label="Approved last 7d" value="312" />
            <Row label="Auto-assigned" value="0 · review-required mode" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Support queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Open tickets" value="6" />
            <Row label="P1 incidents" value="0" />
            <Row label="Avg first response" value="14 min" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-muted/40 py-2">
      <div className="font-display text-base font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function accentGrad(accent: string) {
  const map: Record<string, string> = {
    emerald: "from-emerald-500 to-teal-600",
    violet: "from-violet-500 to-fuchsia-600",
    amber: "from-amber-500 to-orange-600",
    sky: "from-sky-500 to-cyan-600",
    rose: "from-rose-500 to-pink-600",
    indigo: "from-indigo-500 to-violet-600",
    cyan: "from-cyan-500 to-sky-600",
  };
  return map[accent] ?? "from-northstar-500 to-northstar-700";
}
