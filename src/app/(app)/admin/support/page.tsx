import { AlertCircle, CheckCircle2, Clock, LifeBuoy, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KpiCard } from "@/components/shell/kpi-card";
import { initials, relativeDate } from "@/lib/utils";

type Ticket = {
  id: string;
  org: string;
  subject: string;
  status: "open" | "investigating" | "waiting" | "resolved";
  priority: "high" | "normal" | "low";
  submitter: string;
  opened: string;
  lastUpdate: string;
  preview: string;
};

const tickets: Ticket[] = [
  {
    id: "t_01",
    org: "Meridian Health System",
    subject: "SCORM upload stuck on processing",
    status: "open",
    priority: "high",
    submitter: "Priya Nair",
    opened: "2026-04-17T14:22:00Z",
    lastUpdate: "2026-04-18T09:01:00Z",
    preview:
      "Three SCORM packages uploaded yesterday are stuck on \"processing\" — we've tried re-uploading.",
  },
  {
    id: "t_02",
    org: "Atlas University",
    subject: "Feed sync failing silently",
    status: "investigating",
    priority: "high",
    submitter: "Reena Mehta",
    opened: "2026-04-16T18:00:00Z",
    lastUpdate: "2026-04-18T11:12:00Z",
    preview:
      "Workday feed runs report success but new hires aren't appearing. Last successful sync: 3 days ago.",
  },
  {
    id: "t_03",
    org: "Northwind Logistics",
    subject: "CSV import column mapping question",
    status: "waiting",
    priority: "normal",
    submitter: "Quinn Hollister",
    opened: "2026-04-15T09:44:00Z",
    lastUpdate: "2026-04-17T16:33:00Z",
    preview: "Can I map `home_terminal` to our `location` field in the employee import?",
  },
  {
    id: "t_04",
    org: "Meridian Health System",
    subject: "Certificate PDF template — logo position",
    status: "resolved",
    priority: "low",
    submitter: "Jordan Alvarez",
    opened: "2026-04-09T13:15:00Z",
    lastUpdate: "2026-04-14T10:20:00Z",
    preview: "Feature request — easily self-service but wanted to confirm the field name.",
  },
];

const statusMeta: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "outline" }> = {
  open: { label: "Open", variant: "destructive" },
  investigating: { label: "Investigating", variant: "warning" },
  waiting: { label: "Waiting on customer", variant: "secondary" },
  resolved: { label: "Resolved", variant: "success" },
};

const priorityClass: Record<string, string> = {
  high: "text-rose-600 dark:text-rose-400",
  normal: "text-muted-foreground",
  low: "text-muted-foreground/70",
};

export default function SupportPage() {
  const open = tickets.filter((t) => t.status !== "resolved").length;
  const highPri = tickets.filter((t) => t.priority === "high" && t.status !== "resolved").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><LifeBuoy className="h-3 w-3" /> Support</span>}
        title="Tenant support queue"
        description="Every open ticket across all tenants. Integrates with Zendesk / Intercom / HelpScout."
        actions={<Button variant="outline">Export open tickets</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Open tickets" value={open} hint="Across all tenants" icon={MessageCircle} accent="rose" delta={-12} />
        <KpiCard label="High priority" value={highPri} hint="Needs attention" icon={AlertCircle} accent="amber" delta={-1} />
        <KpiCard label="First response" value="38m" hint="Target: 60m" icon={Clock} accent="sky" />
        <KpiCard label="Resolved (7d)" value={resolved} hint="Closed this week" icon={CheckCircle2} accent="emerald" delta={23} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Queue</CardTitle>
          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-300">{open} open</Badge>
            <Badge variant="outline">{resolved} resolved</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {tickets.map((t) => (
              <li key={t.id} className="group flex items-start gap-4 p-4 transition hover:bg-muted/40">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-[11px] text-primary">
                    {initials(t.submitter)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">#{t.id}</span>
                    <Badge variant={statusMeta[t.status].variant}>{statusMeta[t.status].label}</Badge>
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${priorityClass[t.priority]}`}>
                      {t.priority} priority
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">{relativeDate(t.lastUpdate)}</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold">{t.subject}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {t.submitter} · {t.org}
                  </div>
                  <p className="mt-2 line-clamp-1 text-sm text-muted-foreground/90">{t.preview}</p>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 transition group-hover:opacity-100">
                  Open
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
