import { notFound } from "next/navigation";
import { Brain } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiReviewQueue } from "@/components/ai/ai-review-queue";
import { GroomingButton } from "@/components/ai/grooming-button";
import {
  aiSuggestions,
  getCourseById,
  getOrgBySlug,
  getUserById,
  getWorkspaceBySlug,
} from "@/lib/data";

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
            <GroomingButton orgId={org.id} workspaceId={ws.id} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <AiReviewQueue
            items={pending.map((s) => {
              const u = getUserById(s.userId);
              const c = s.courseId ? getCourseById(s.courseId) : null;
              return {
                id: s.id,
                userName: u?.name ?? "Unknown",
                userTitle: u?.employee?.title,
                courseTitle: c?.title ?? "Unknown course",
                confidence: s.confidence,
                createdAt: s.createdAt,
                reason: s.reason,
                evidence: s.evidence,
              };
            })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
