import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { CourseBrowser } from "@/components/course/course-browser";
import { getCoursesForWorkspace, getOrgBySlug, getWorkspaceBySlug } from "@/lib/data";

export default async function WorkspaceCoursesPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const courses = getCoursesForWorkspace(ws.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3" /> Courses</span>}
        title={`${ws.name} · Course library`}
        description="Every course in this workspace. Filter, search, and drill in."
        actions={
          <Button asChild>
            <Link href={`/org/${orgSlug}/w/${wsSlug}/courses/new`}>
              <Plus className="h-4 w-4" /> New course
            </Link>
          </Button>
        }
      />

      <CourseBrowser courses={courses} hrefPrefix={`/org/${orgSlug}/w/${wsSlug}/courses`} />
    </div>
  );
}
