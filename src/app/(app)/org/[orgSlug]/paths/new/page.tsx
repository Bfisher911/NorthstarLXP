import { notFound } from "next/navigation";
import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCoursesForOrg, getOrgBySlug, getWorkspaceById } from "@/lib/data";

export default async function NewOrgPathPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const catalog = getCoursesForOrg(org.id).filter((c) => c.shareToOrg);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/org/${orgSlug}/paths`}><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>
      </Button>
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Compass className="h-3 w-3" /> Build an org path</span>}
        title="Compose a master organizational learning path"
        description="Pick content shared from any workspace, then lay it out visually in the path builder (Phase 3)."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Path details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input placeholder="e.g. New-hire onboarding" className="mt-1" />
            </div>
            <div>
              <Label>Audience</Label>
              <Input placeholder="e.g. All clinical employees" className="mt-1" />
            </div>
            <div>
              <Label>Completion credential</Label>
              <Input placeholder="e.g. Clinical Foundations" className="mt-1" />
            </div>
            <Button className="w-full">Create and open builder</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shared catalog</CardTitle>
            <p className="text-sm text-muted-foreground">Courses with "share to organization" enabled.</p>
          </CardHeader>
          <CardContent className="divide-y">
            {catalog.map((c) => {
              const src = getWorkspaceById(c.workspaceId);
              return (
                <div key={c.id} className="flex items-center gap-3 py-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.thumbnailColor} text-lg`}>
                    {c.thumbnailEmoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{src?.name} · {c.durationMinutes} min</div>
                  </div>
                  <Badge variant="outline">{c.category}</Badge>
                  <Button size="sm" variant="outline">Add to path</Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
