import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { requireSession } from "@/lib/auth";
import { assignments as allAssignments, getDirectReports } from "@/lib/data";
import { initials } from "@/lib/utils";

export default async function TeamPage() {
  const { user } = await requireSession();
  const team = getDirectReports(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Team"
        title="Direct reports"
        description="Drill into any team member to see their complete learning record."
      />
      <div className="grid gap-3">
        {team.map((m) => {
          const a = allAssignments.filter((x) => x.userId === m.id);
          const completed = a.filter((x) => x.status === "completed").length;
          const total = a.length || 1;
          const progress = Math.round((completed / total) * 100);
          const overdue = a.filter((x) => x.status === "overdue").length;
          return (
            <Link
              key={m.id}
              href={`/manager/team/${m.id}`}
              className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition hover:border-primary/50"
            >
              <Avatar>
                <AvatarFallback>{initials(m.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{m.name}</span>
                  <Badge variant="outline" className="text-[10px]">{m.employee?.title}</Badge>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{m.employee?.department}</span>
                  <span>·</span>
                  <span>{m.employee?.campus ?? m.employee?.location}</span>
                  <span>·</span>
                  <span>{completed}/{total} complete</span>
                  {overdue > 0 && <Badge variant="destructive" className="text-[10px]">{overdue} overdue</Badge>}
                </div>
                <Progress value={progress} className="mt-2 h-1.5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
            </Link>
          );
        })}
        {team.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No direct reports assigned.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
