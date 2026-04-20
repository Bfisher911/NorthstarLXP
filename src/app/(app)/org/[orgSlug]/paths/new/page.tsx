import { notFound } from "next/navigation";
import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { OrgPathBuilder } from "@/components/path/org-path-builder";
import { getCoursesForOrg, getOrgBySlug, getWorkspaceById } from "@/lib/data";

export default async function NewOrgPathPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const catalog = getCoursesForOrg(org.id)
    .filter((c) => c.shareToOrg)
    .map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      durationMinutes: c.durationMinutes,
      thumbnailColor: c.thumbnailColor,
      thumbnailEmoji: c.thumbnailEmoji,
      sourceName: getWorkspaceById(c.workspaceId)?.name ?? "Workspace",
    }));

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/org/${orgSlug}/paths`}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      </Button>
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Compass className="h-3 w-3" /> Build an org path</span>}
        title="Compose a master organizational learning path"
        description="Pick content shared from any workspace, then finalize it in the visual builder."
      />
      <OrgPathBuilder catalog={catalog} backHref={`/org/${orgSlug}/paths`} />
    </div>
  );
}
