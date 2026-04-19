import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  FileText,
  Link as LinkIcon,
  PlayCircle,
  ScrollText,
  ShieldCheck,
  Video,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOrgBySlug, getWorkspaceBySlug } from "@/lib/data";

const types = [
  { id: "authored", icon: BookOpen, title: "Authored course", desc: "Build lessons, videos, and quizzes in Northstar's editor." },
  { id: "scorm", icon: PlayCircle, title: "SCORM package", desc: "Upload a .zip package. We handle launch and completion tracking." },
  { id: "aicc", icon: LinkIcon, title: "AICC", desc: "Legacy AICC packages for existing content libraries." },
  { id: "live_session", icon: Video, title: "Live session", desc: "Instructor-led, in-person or virtual with registration." },
  { id: "policy_attestation", icon: ShieldCheck, title: "Policy attestation", desc: "Upload a PDF; learners read and attest." },
  { id: "evidence_task", icon: ClipboardCheck, title: "Evidence task", desc: "Learners upload evidence; admins review and approve." },
  { id: "survey", icon: FileText, title: "Survey / needs assessment", desc: "Answers drive downstream course assignments." },
] as const;

export default async function NewCoursePage({
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
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/org/${orgSlug}/w/${wsSlug}/courses`}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
        </Link>
      </Button>
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><ScrollText className="h-3 w-3" /> Create a course</span>}
        title="Pick a course type"
        description="All types share the same assignment, certificate, and renewal system. You can swap types later."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {types.map((t) => (
          <Link
            key={t.id}
            href={`/org/${orgSlug}/w/${wsSlug}/courses/new/${t.id}`}
            className="group rounded-2xl border bg-card p-5 transition hover:border-primary/50 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <t.icon className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-semibold">{t.title}</span>
              <Badge variant="outline" className="text-[10px]">{t.id}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What happens next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">1. Draft the course.</strong> You'll land in the builder with metadata, modules, and settings panels.
          </p>
          <p>
            <strong className="text-foreground">2. Add AI context.</strong> Describe who should take it — Northstar uses this to suggest assignments.
          </p>
          <p>
            <strong className="text-foreground">3. Publish.</strong> Mark it published to make it assignable. Draft courses can still be previewed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
