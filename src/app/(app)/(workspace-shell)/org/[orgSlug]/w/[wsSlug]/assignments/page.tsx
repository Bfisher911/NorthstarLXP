import Link from "next/link";
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
import { AssignmentMethodLauncher } from "@/components/assignments/method-launcher";
import { getCoursesForWorkspace, getOrgBySlug, getWorkspaceBySlug, users } from "@/lib/data";

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

  const learners = users
    .filter((u) => u.orgId === org.id && u.roles.some((r) => r.role === "learner"))
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      title: u.employee?.title,
      department: u.employee?.department,
    }));
  const courses = getCoursesForWorkspace(ws.id).map((c) => ({ id: c.id, title: c.title }));

  const base = `/org/${orgSlug}/w/${wsSlug}`;

  const methods = [
    {
      key: "manual",
      icon: UserPlus,
      title: "Manual direct assignment",
      desc: "Pick one or more users by name.",
    },
    {
      key: "csv",
      icon: FileSpreadsheet,
      title: "CSV bulk upload",
      desc: "Assign by email or unique ID in bulk.",
    },
    {
      key: "group",
      icon: Users,
      title: "Saved group",
      desc: "Use any saved group (manual or smart).",
      href: `${base}/groups`,
    },
    {
      key: "smart_rule",
      icon: Workflow,
      title: "Smart group (rule-based)",
      desc: "Department, title, campus, hire date, custom fields.",
      href: `${base}/groups`,
    },
    {
      key: "survey",
      icon: FileText,
      title: "Survey trigger",
      desc: "Assign downstream courses based on survey answers.",
      href: `${base}/surveys`,
    },
    {
      key: "ai",
      icon: Brain,
      title: "AI recommendation",
      desc: "Let the engine propose likely-required learners.",
      href: `${base}/ai`,
    },
    {
      key: "self",
      icon: Link2,
      title: "Self-enrollment link",
      desc: "Share a URL; link acts as a direct launch if already assigned.",
    },
    {
      key: "org_path",
      icon: Send,
      title: "Org-wide path",
      desc: "Triggered by the organization admin.",
      href: `/org/${orgSlug}/paths`,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Send className="h-3 w-3" /> Assignments</span>}
        title="Assignment center"
        description="Every way to get training to learners. Mix and match for a given course or path."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {methods.map((m) => {
          const body = (
            <>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <m.icon className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold">{m.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{m.desc}</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                Launch flow <ArrowRight className="h-3 w-3" />
              </div>
            </>
          );
          if ("href" in m && m.href) {
            return (
              <Link
                key={m.key}
                href={m.href}
                className="rounded-2xl border bg-card p-5 text-left card-hover"
              >
                {body}
              </Link>
            );
          }
          return (
            <AssignmentMethodLauncher
              key={m.key}
              kind={m.key}
              learners={learners}
              courses={courses}
              trigger={
                <button
                  type="button"
                  className="w-full rounded-2xl border bg-card p-5 text-left card-hover"
                >
                  {body}
                </button>
              }
            />
          );
        })}
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
