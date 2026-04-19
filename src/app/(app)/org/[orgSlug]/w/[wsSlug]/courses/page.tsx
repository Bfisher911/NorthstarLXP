import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCoursesForWorkspace, getOrgBySlug, getWorkspaceBySlug } from "@/lib/data";
import { relativeDate } from "@/lib/utils";

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
        description="Every course in this workspace, with status, type, and last updated."
        actions={
          <Button asChild>
            <Link href={`/org/${orgSlug}/w/${wsSlug}/courses/new`}>
              <Plus className="h-4 w-4" /> New course
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search courses…" />
        </div>
        <Button variant="outline">Category</Button>
        <Button variant="outline">Type</Button>
        <Button variant="outline">Status</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((c) => (
          <Card key={c.id} className="group overflow-hidden transition hover:border-primary/60 hover:shadow-md">
            <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${c.thumbnailColor} text-4xl text-white`}>
              {c.thumbnailEmoji}
              {c.shareToOrg && (
                <Badge variant="outline" className="absolute right-2 top-2 border-white/30 bg-white/10 text-white">
                  Shared org-wide
                </Badge>
              )}
            </div>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                <Badge variant="outline" className="text-[10px] capitalize">{c.type.replace("_", " ")}</Badge>
                {!c.published && <Badge variant="warning" className="text-[10px]">Draft</Badge>}
              </div>
              <div className="font-semibold line-clamp-2">{c.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{c.summary}</div>
              <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                <span>Updated {relativeDate(c.updatedAt)}</span>
                <span>{c.durationMinutes} min</span>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/org/${orgSlug}/w/${wsSlug}/courses/${c.id}`}>
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
