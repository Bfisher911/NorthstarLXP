import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { CourseCreateForm } from "@/components/course/course-create-form";
import { getOrgBySlug, getWorkspaceBySlug } from "@/lib/data";

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

  const backHref = `/org/${orgSlug}/w/${wsSlug}/courses`;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={backHref}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
        </Link>
      </Button>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1">
            <ScrollText className="h-3 w-3" /> Create a course · {ws.name}
          </span>
        }
        title="Start a new course"
        description="Pick a type, name it, and save a draft. You can refine modules, assessments, and AI context in the builder afterward."
      />
      <CourseCreateForm
        backHref={backHref}
        coursesHref={backHref}
        orgId={org.id}
        workspaceId={ws.id}
        orgSlug={orgSlug}
        wsSlug={wsSlug}
      />
    </div>
  );
}
