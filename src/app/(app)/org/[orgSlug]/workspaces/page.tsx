import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOrgBySlug, getUserById, getWorkspacesForOrg } from "@/lib/data";
import { formatPct } from "@/lib/utils";

export default async function WorkspacesIndexPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspacesForOrg(org.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspaces"
        title="Departments in your organization"
        description="Each workspace is an isolated mini-LMS. Admins and authors are scoped to their workspace."
        actions={<Button><Building2 className="h-4 w-4" /> New workspace</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ws.map((w) => {
          const lead = getUserById(w.lead);
          return (
            <Card key={w.id} className="group overflow-hidden transition hover:border-primary/50 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl ring-1 ring-primary/15">
                    {w.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{w.name}</div>
                    <div className="text-xs text-muted-foreground">{w.department}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{formatPct(w.complianceHealth)}</Badge>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{w.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Lead: {lead?.name ?? "—"}</span>
                  <span>{w.courseCount} courses · {w.pathCount} paths</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/org/${orgSlug}/w/${w.slug}`}>
                      Enter workspace <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
