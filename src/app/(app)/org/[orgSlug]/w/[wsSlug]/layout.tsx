import { notFound } from "next/navigation";
import {
  BarChart3,
  BellRing,
  BookOpen,
  Brain,
  Compass,
  FileCheck2,
  Home,
  Send,
  Settings,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import type { NavGroup } from "@/components/shell/sidebar";
import { canAccessWorkspace, requireSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getAiSuggestionsForWorkspace,
  getOrgBySlug,
  getWorkspaceBySlug,
} from "@/lib/data";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const { user, impersonating } = await requireSession();
  if (!canAccessWorkspace(user, org.id, ws.id)) {
    redirect(`/org/${org.slug}`);
  }

  const base = `/org/${orgSlug}/w/${wsSlug}`;
  const ai = getAiSuggestionsForWorkspace(ws.id).filter((s) => s.status === "pending").length;

  const groups: NavGroup[] = [
    {
      items: [
        { title: "Dashboard", href: base, icon: <Home />, exact: true },
        { title: "Courses", href: `${base}/courses`, icon: <BookOpen /> },
        { title: "Learning paths", href: `${base}/paths`, icon: <Compass /> },
        { title: "Surveys", href: `${base}/surveys`, icon: <FileCheck2 /> },
      ],
    },
    {
      label: "Distribution",
      items: [
        { title: "Assignments", href: `${base}/assignments`, icon: <Send /> },
        { title: "Smart groups", href: `${base}/groups`, icon: <Users /> },
        { title: "Notifications", href: `${base}/notifications`, icon: <BellRing /> },
      ],
    },
    {
      label: "Insight",
      items: [
        { title: "AI review", href: `${base}/ai`, icon: <Brain />, badge: ai || undefined },
        { title: "Reports", href: `${base}/reports`, icon: <BarChart3 /> },
      ],
    },
    { label: "Workspace", items: [{ title: "Settings", href: `${base}/settings`, icon: <Settings /> }] },
  ];

  return (
    <AppShell
      groups={groups}
      user={{ id: user.id, name: user.name, email: user.email }}
      role="workspace_admin"
      roleLabel="Workspace Admin"
      scopeLabel={`${ws.emoji} ${ws.name}`}
      orgId={org.id}
      orgSlug={org.slug}
      impersonating={!!impersonating}
    >
      {children}
    </AppShell>
  );
}
