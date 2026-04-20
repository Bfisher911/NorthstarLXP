import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { PathCreateForm } from "@/components/path/path-create-form";
import { getOrgBySlug, getWorkspaceBySlug } from "@/lib/data";

export default async function NewPathPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const backHref = `/org/${orgSlug}/w/${wsSlug}/paths`;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={backHref}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      </Button>
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Compass className="h-3 w-3" /> New path</span>}
        title={`Create a path in ${ws.name}`}
        description="Create the shell, then lay out nodes in the visual journey builder."
      />
      <PathCreateForm backHref={backHref} />
    </div>
  );
}
