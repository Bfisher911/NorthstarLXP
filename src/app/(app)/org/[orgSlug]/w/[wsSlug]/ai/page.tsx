import { notFound } from "next/navigation";
import { Brain, Check, X } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  aiSuggestions,
  getCourseById,
  getOrgBySlug,
  getUserById,
  getWorkspaceBySlug,
} from "@/lib/data";
import { initials, relativeDate } from "@/lib/utils";

export default async function AiReviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const queue = aiSuggestions.filter((s) => s.workspaceId === ws.id);
  const pending = queue.filter((s) => s.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Brain className="h-3 w-3 text-violet-500" /> AI review</span>}
        title="AI assignment suggestions"
        description="Every suggestion shows why it was proposed. Approve to assign, reject to suppress, or swap the target course."
      />

      <Card className="border-violet-400/30 bg-gradient-to-br from-violet-500/5 to-background">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-300">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold">Review-required mode</div>
              <div className="text-sm text-muted-foreground">
                Suggestions need a human ✓ before an assignment is created. Switch to auto-assign in settings.
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary">{pending.length} pending</Badge>
            <Button variant="outline">Run grooming job</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {pending.map((s) => {
            const u = getUserById(s.userId);
            const c = s.courseId ? getCourseById(s.courseId) : null;
            return (
              <div key={s.id} className="flex items-start gap-4 py-4">
                <Avatar>
                  <AvatarFallback>{initials(u?.name ?? "?")}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{u?.name}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{u?.employee?.title}</span>
                    <Badge variant="outline">{Math.round(s.confidence * 100)}% confidence</Badge>
                    <span className="text-xs text-muted-foreground">· {relativeDate(s.createdAt)}</span>
                  </div>
                  <div className="mt-1 text-sm">
                    Suggest assigning <span className="font-medium">{c?.title}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.reason}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.evidence.map((e) => (
                      <Badge key={e} variant="outline" className="text-[10px]">
                        {e}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" className="h-8">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="h-8">
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </div>
            );
          })}
          {pending.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nothing to review. Nice work.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
