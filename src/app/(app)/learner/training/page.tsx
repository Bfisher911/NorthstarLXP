import Link from "next/link";
import { ArrowRight, Clock, Filter } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireSession } from "@/lib/auth";
import { getAssignmentsForUser, getCourseById } from "@/lib/data";
import { formatDate, relativeDate } from "@/lib/utils";

export default async function TrainingPage() {
  const { user } = await requireSession();
  const assignments = getAssignmentsForUser(user.id);

  const groups = {
    overdue: assignments.filter((a) => a.status === "overdue"),
    due: assignments.filter((a) => a.status !== "completed" && a.status !== "overdue"),
    completed: assignments.filter((a) => a.status === "completed"),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My training"
        title="Your assignments"
        description="Everything assigned to you — by due date and source. You can see exactly why each item was assigned."
        actions={
          <Button variant="outline">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        }
      />

      <Tabs defaultValue="due">
        <TabsList>
          <TabsTrigger value="overdue">
            Overdue <Badge variant="destructive" className="ml-2">{groups.overdue.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="due">
            Due / In progress <Badge variant="outline" className="ml-2">{groups.due.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed <Badge variant="outline" className="ml-2">{groups.completed.length}</Badge>
          </TabsTrigger>
        </TabsList>
        {(["overdue", "due", "completed"] as const).map((key) => (
          <TabsContent key={key} value={key}>
            <div className="grid gap-3">
              {groups[key].map((a) => {
                const course = a.courseId ? getCourseById(a.courseId) : undefined;
                if (!course) return null;
                return (
                  <Link
                    key={a.id}
                    href={`/learner/course/${course.id}`}
                    className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition hover:border-primary/50 hover:bg-accent/40"
                  >
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${course.thumbnailColor} text-2xl`}>
                      {course.thumbnailEmoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold">{course.title}</span>
                        <Badge variant="outline" className="text-[10px]">{course.category}</Badge>
                        {course.required && <Badge variant="info" className="text-[10px]">Required</Badge>}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {course.durationMinutes} min
                        {a.dueAt && ` · ${a.status === "overdue" ? `Overdue — was due ${formatDate(a.dueAt)}` : `Due ${relativeDate(a.dueAt)}`}`}
                        {a.completedAt && ` · Completed ${formatDate(a.completedAt)}`}
                        {a.source && ` · ${a.source}`}
                      </div>
                      {key !== "completed" && <Progress value={a.progress * 100} className="mt-2 h-1.5" />}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                  </Link>
                );
              })}
              {groups[key].length === 0 && (
                <Card>
                  <CardContent className="p-10 text-center text-sm text-muted-foreground">
                    Nothing here. Nice work.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
