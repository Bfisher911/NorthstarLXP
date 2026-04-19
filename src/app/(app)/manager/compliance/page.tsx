import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldCheck } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { assignments as allAssignments, getCourseById, getDirectReports } from "@/lib/data";

export default async function CompliancePage() {
  const { user } = await requireSession();
  const team = getDirectReports(user.id);
  const teamIds = new Set(team.map((u) => u.id));
  const teamAssignments = allAssignments.filter((a) => teamIds.has(a.userId));

  const byCourse = new Map<string, { total: number; completed: number }>();
  for (const a of teamAssignments) {
    if (!a.courseId) continue;
    const c = byCourse.get(a.courseId) ?? { total: 0, completed: 0 };
    c.total++;
    if (a.status === "completed") c.completed++;
    byCourse.set(a.courseId, c);
  }

  const rows = Array.from(byCourse.entries()).map(([courseId, stats]) => ({
    course: getCourseById(courseId)!,
    ...stats,
    pct: stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100),
  })).sort((a, b) => a.pct - b.pct);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Compliance</span>}
        title="Team compliance by course"
        description="Where is your team furthest behind? Sorted by lowest completion first."
      />
      {rows.length === 0 ? (
        <EmptyState title="No data yet" description="Compliance health appears once assignments are in motion." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Completion rates</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {rows.map((r) => (
              <div key={r.course.id} className="flex items-center gap-4 py-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${r.course.thumbnailColor} text-lg`}>
                  {r.course.thumbnailEmoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{r.course.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.completed} of {r.total} complete
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-northstar-500 to-northstar-300"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-semibold">{r.pct}%</div>
                  <div className="text-xs text-muted-foreground">complete</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
