import { notFound } from "next/navigation";
import {
  ArrowRight,
  Brain,
  FileSpreadsheet,
  FileText,
  Link2,
  Send,
  Upload,
  Users,
  UserPlus,
  Workflow,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOrgBySlug, getWorkspaceBySlug } from "@/lib/data";

const methods = [
  { icon: UserPlus, title: "Manual direct assignment", desc: "Pick one or more users by name." },
  { icon: FileSpreadsheet, title: "CSV bulk upload", desc: "Assign by email or unique ID in bulk." },
  { icon: Users, title: "Saved group", desc: "Use any saved group (manual or smart)." },
  { icon: Workflow, title: "Smart group (rule-based)", desc: "Department, title, campus, hire date, custom fields." },
  { icon: FileText, title: "Survey trigger", desc: "Assign downstream courses based on survey answers." },
  { icon: Brain, title: "AI recommendation", desc: "Let the engine propose likely-required learners." },
  { icon: Link2, title: "Self-enrollment link", desc: "Share a URL; link acts as a direct launch if already assigned." },
  { icon: Send, title: "Org-wide path", desc: "Triggered by the organization admin." },
];

export default async function AssignmentsPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Send className="h-3 w-3" /> Assignments</span>}
        title="Assignment center"
        description="Every way to get training to learners. Mix and match for a given course or path."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {methods.map((m) => (
          <button key={m.title} className="rounded-2xl border bg-card p-5 text-left card-hover">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <m.icon className="h-4 w-4" />
            </div>
            <div className="text-sm font-semibold">{m.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{m.desc}</div>
            <div className="mt-3 flex items-center gap-1 text-xs text-primary">
              Launch flow <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-4 w-4" /> Recent assignment batches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="CSV · HIPAA Privacy & Security Core" value="412 users · Apr 15" />
          <Row label="Smart Group · ICU Clinical Staff" value="Assigned 6 courses · Apr 12" />
          <Row label="Survey trigger · Safety Needs Assessment" value="184 downstream assignments · Apr 14" />
          <Row label="AI · Bloodborne Pathogens" value="12 suggestions pending review" tone="info" />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "info" }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-0">
      <span className="truncate text-muted-foreground">{label}</span>
      {tone === "info" ? <Badge variant="info">{value}</Badge> : <span className="font-medium">{value}</span>}
    </div>
  );
}
