import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, Filter } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCoursesForOrg, getOrgBySlug, getWorkspaceById } from "@/lib/data";

export default async function OrgCatalogPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const catalog = getCoursesForOrg(org.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3" /> Catalog</span>}
        title="Shared catalog"
        description="Every published course across your workspaces. Workspace authors decide whether a course is visible at the org level."
        actions={<Button variant="outline"><Filter className="h-4 w-4" /> Filters</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {catalog.map((c) => {
          const src = getWorkspaceById(c.workspaceId);
          return (
            <Card key={c.id} className="group overflow-hidden">
              <div className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${c.thumbnailColor} text-4xl text-white`}>
                {c.thumbnailEmoji}
                {c.shareToOrg && (
                  <Badge variant="outline" className="absolute right-2 top-2 border-white/30 bg-white/10 text-white">
                    Shared
                  </Badge>
                )}
              </div>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                  <Badge variant="outline" className="text-[10px]">{c.durationMinutes}m</Badge>
                  {c.type !== "authored" && <Badge variant="secondary" className="text-[10px] capitalize">{c.type.replace("_", " ")}</Badge>}
                </div>
                <div className="font-semibold line-clamp-2">{c.title}</div>
                <div className="text-xs text-muted-foreground">From {src?.name}</div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/org/${orgSlug}/w/${src?.slug}/courses/${c.id}`}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
