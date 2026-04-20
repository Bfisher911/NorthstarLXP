import { AlertTriangle, CheckCircle2, Clock, Database, RefreshCw, Settings2, Users } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/shell/kpi-card";
import { relativeDate } from "@/lib/utils";

type ConnectorStatus = "healthy" | "degraded" | "paused";
type Connector = {
  id: string;
  org: string;
  provider: string;
  accent: string;
  status: ConnectorStatus;
  employees: number;
  lastSync: string;
  cadence: string;
  notes: string;
};

const connectors: Connector[] = [
  {
    id: "c1",
    org: "Meridian Health System",
    provider: "Workday",
    accent: "bg-[#003a70]",
    status: "healthy",
    employees: 14032,
    lastSync: "2026-04-18T06:00:00Z",
    cadence: "Hourly · incremental",
    notes: "Field map: 42 fields · Manager graph enabled",
  },
  {
    id: "c2",
    org: "Meridian Health System",
    provider: "Epic (custom extract)",
    accent: "bg-rose-600",
    status: "healthy",
    employees: 8210,
    lastSync: "2026-04-18T05:00:00Z",
    cadence: "Daily · full refresh",
    notes: "Clinical role codes normalized via mapping table",
  },
  {
    id: "c3",
    org: "Atlas University",
    provider: "Workday",
    accent: "bg-[#003a70]",
    status: "degraded",
    employees: 6504,
    lastSync: "2026-04-15T03:00:00Z",
    cadence: "Daily · incremental",
    notes: "Auth token rotated — re-authorize OAuth connector",
  },
  {
    id: "c4",
    org: "Atlas University",
    provider: "Banner SIS",
    accent: "bg-sky-700",
    status: "healthy",
    employees: 34120,
    lastSync: "2026-04-18T02:30:00Z",
    cadence: "Every 6h · incremental",
    notes: "Student feed — instructor-of-record resolves faculty assignments",
  },
  {
    id: "c5",
    org: "Northwind Logistics",
    provider: "UKG Ready",
    accent: "bg-emerald-700",
    status: "healthy",
    employees: 1802,
    lastSync: "2026-04-18T04:15:00Z",
    cadence: "Hourly · incremental",
    notes: "CDL driver flag drives defensive driving auto-assignment",
  },
  {
    id: "c6",
    org: "Northwind Logistics",
    provider: "CSV upload",
    accent: "bg-slate-600",
    status: "paused",
    employees: 212,
    lastSync: "2026-04-02T12:00:00Z",
    cadence: "Manual",
    notes: "Terminal-specific list, manually uploaded by ops lead",
  },
];

const statusMeta: Record<string, { label: string; tone: string; icon: React.ReactNode }> = {
  healthy: {
    label: "Healthy",
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  degraded: {
    label: "Needs attention",
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  paused: {
    label: "Paused",
    tone: "bg-muted text-muted-foreground",
    icon: <Clock className="h-3 w-3" />,
  },
};

export default function FeedSyncPage() {
  const healthy = connectors.filter((c) => c.status === "healthy").length;
  const degraded = connectors.filter((c) => c.status === "degraded").length;
  const totalEmployees = connectors.reduce((sum, c) => sum + c.employees, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Database className="h-3 w-3" /> Feed sync</span>}
        title="Employee feed synchronization"
        description="Every tenant, every connector, every sync — one operational view."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings2 className="h-3.5 w-3.5" /> Connector defaults
            </Button>
            <Button>
              <RefreshCw className="h-3.5 w-3.5" /> Run all now
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Connectors" value={connectors.length} icon={Database} accent="sky" />
        <KpiCard label="Healthy" value={healthy} hint={`${healthy}/${connectors.length}`} icon={CheckCircle2} accent="emerald" />
        <KpiCard label="Needs attention" value={degraded} icon={AlertTriangle} accent="amber" delta={degraded > 0 ? 1 : undefined} />
        <KpiCard label="Employees synced" value={totalEmployees.toLocaleString()} icon={Users} accent="violet" delta={3} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connectors</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {connectors.map((c) => {
            const meta = statusMeta[c.status];
            return (
              <div
                key={c.id}
                className="group relative overflow-hidden rounded-xl border bg-card p-4 transition hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${c.accent}`}
                    aria-hidden
                  >
                    <Database className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{c.provider}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.tone}`}>
                        {meta.icon} {meta.label}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{c.org}</div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Employees</div>
                        <div className="font-semibold">{c.employees.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last sync</div>
                        <div className="font-semibold">{relativeDate(c.lastSync)}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-muted-foreground">Cadence</div>
                        <div className="font-semibold">{c.cadence}</div>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs text-muted-foreground/90">{c.notes}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 border-t pt-3">
                  <Button size="sm" variant="ghost">
                    View logs
                  </Button>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-3 w-3" /> Sync now
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
