import { BellRing, Check, Eye, Mail, MousePointerClick, Send } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KpiCard } from "@/components/shell/kpi-card";
import { requireSession } from "@/lib/auth";
import { getDirectReports, getCourseById } from "@/lib/data";
import { initials, relativeDate } from "@/lib/utils";

type ReminderStatus = "delivered" | "opened" | "clicked" | "completed";

type Reminder = {
  id: string;
  recipientUserId: string;
  courseId: string;
  sentAt: string;
  channel: "email" | "in_app";
  template: "due_soon" | "overdue" | "encouragement";
  status: ReminderStatus;
  openedAt?: string;
  clickedAt?: string;
};

const templateLabel: Record<Reminder["template"], string> = {
  due_soon: "Due-soon nudge",
  overdue: "Overdue follow-up",
  encouragement: "Encouragement",
};

const statusMeta: Record<ReminderStatus, { label: string; variant: "default" | "success" | "secondary" | "warning" | "info" }> = {
  delivered: { label: "Delivered", variant: "secondary" },
  opened: { label: "Opened", variant: "info" },
  clicked: { label: "Clicked through", variant: "default" },
  completed: { label: "Led to completion", variant: "success" },
};

export default async function RemindersPage() {
  const { user } = await requireSession();
  const reports = getDirectReports(user.id);

  // Synthesize a realistic 14-day reminder log using the manager's reports
  // and the platform's seeded courses. This mirrors what the notifications
  // service will return once wired up.
  const reminders: Reminder[] = [
    {
      id: "r1",
      recipientUserId: reports[1]?.id ?? reports[0]?.id ?? "u_learner_2",
      courseId: "c_code_of_conduct",
      sentAt: "2026-04-17T13:15:00Z",
      channel: "email",
      template: "due_soon",
      status: "opened",
      openedAt: "2026-04-17T14:02:00Z",
    },
    {
      id: "r2",
      recipientUserId: reports[3]?.id ?? reports[0]?.id ?? "u_learner_4",
      courseId: "c_infection_control",
      sentAt: "2026-04-17T09:40:00Z",
      channel: "email",
      template: "overdue",
      status: "completed",
      openedAt: "2026-04-17T10:21:00Z",
      clickedAt: "2026-04-17T10:22:00Z",
    },
    {
      id: "r3",
      recipientUserId: reports[0]?.id ?? "u_learner_1",
      courseId: "c_bbp",
      sentAt: "2026-04-15T08:00:00Z",
      channel: "in_app",
      template: "overdue",
      status: "clicked",
      openedAt: "2026-04-15T08:01:00Z",
      clickedAt: "2026-04-15T09:47:00Z",
    },
    {
      id: "r4",
      recipientUserId: reports[2]?.id ?? "u_learner_3",
      courseId: "c_bbp",
      sentAt: "2026-04-14T11:20:00Z",
      channel: "email",
      template: "due_soon",
      status: "delivered",
    },
    {
      id: "r5",
      recipientUserId: reports[4]?.id ?? reports[0]?.id ?? "u_learner_5",
      courseId: "c_fire_safety",
      sentAt: "2026-04-12T14:00:00Z",
      channel: "email",
      template: "encouragement",
      status: "opened",
      openedAt: "2026-04-12T15:00:00Z",
    },
  ];

  const delivered = reminders.length;
  const opened = reminders.filter((r) => r.status !== "delivered").length;
  const clicked = reminders.filter((r) => r.status === "clicked" || r.status === "completed").length;
  const completed = reminders.filter((r) => r.status === "completed").length;

  const openRate = delivered ? Math.round((opened / delivered) * 100) : 0;
  const ctr = delivered ? Math.round((clicked / delivered) * 100) : 0;

  const reportById = new Map(reports.map((r) => [r.id, r]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><BellRing className="h-3 w-3" /> Communication</span>}
        title="Reminders sent"
        description="Every nudge you've sent to a team member in the last 14 days, with delivery receipts."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Delivered" value={delivered} hint="Last 14 days" icon={Send} accent="sky" />
        <KpiCard label="Open rate" value={`${openRate}%`} icon={Eye} accent="violet" delta={8} />
        <KpiCard label="Click-through" value={`${ctr}%`} icon={MousePointerClick} accent="emerald" delta={6} />
        <KpiCard label="Led to completion" value={completed} hint="Closed the loop" icon={Check} accent="cyan" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent reminders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {reminders.map((r) => {
              const recipient = reportById.get(r.recipientUserId);
              const course = getCourseById(r.courseId);
              const meta = statusMeta[r.status];
              return (
                <li key={r.id} className="flex items-start gap-4 p-4 transition hover:bg-muted/40">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-[11px] text-primary">
                      {recipient ? initials(recipient.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{recipient?.name ?? "Unknown"}</span>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {r.channel === "email" ? (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" /> Email
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <BellRing className="h-3 w-3" /> In-app
                          </span>
                        )}
                      </Badge>
                      <span className="ml-auto text-xs text-muted-foreground">{relativeDate(r.sentAt)}</span>
                    </div>
                    <div className="mt-1 text-sm">
                      <span className="text-muted-foreground">{templateLabel[r.template]} · </span>
                      <span className="font-medium">{course?.title ?? "—"}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {r.openedAt && (
                        <span>Opened {relativeDate(r.openedAt)}</span>
                      )}
                      {r.clickedAt && (
                        <span> · Clicked {relativeDate(r.clickedAt)}</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
