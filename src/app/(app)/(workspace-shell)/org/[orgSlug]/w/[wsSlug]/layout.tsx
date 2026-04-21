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
  getWorkspaceById,
  getWorkspaceBySlug,
  getWorkspacesForOrg,
} from "@/lib/data";
import { WorkspaceSwitcher } from "@/components/shell/workspace-switcher";

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

  // Build the set of workspaces this user actually administers, so we can show
  // the switcher dropdown only when there's something to switch between.
  // Super admins and org admins see every workspace in the org.
  const isSuperOrOrgAdmin = user.roles.some(
    (r) => r.role === "super_admin" || r.role === "org_admin"
  );
  const adminableWsIds = new Set<string>();
  if (isSuperOrOrgAdmin) {
    getWorkspacesForOrg(org.id).forEach((w) => adminableWsIds.add(w.id));
  } else {
    user.roles.forEach((r) => {
      if (
        r.workspaceId &&
        ["workspace_admin", "workspace_author", "workspace_viewer"].includes(r.role)
      ) {
        adminableWsIds.add(r.workspaceId);
      }
    });
  }
  const switcherOptions = Array.from(adminableWsIds)
    .map((id) => getWorkspaceById(id))
    .filter((w): w is NonNullable<typeof w> => !!w && w.orgId === org.id)
    .map((w) => ({
      id: w.id,
      name: w.name,
      emoji: w.emoji,
      href: `/org/${orgSlug}/w/${w.slug}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

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

  const multi = switcherOptions.length > 1;
  const hasManagerRole = user.roles.some((r) => r.role === "manager");
  const hasNonLearnerSurface = true; // Workspace admin is already a non-learner surface.

  return (
    <AppShell
      groups={groups}
      user={{ id: user.id, name: user.name, email: user.email }}
      role="workspace_admin"
      roleLabel="Workspace Admin"
      scopeLabel={multi ? undefined : `${ws.emoji} ${ws.name}`}
      scopeNode={
        multi ? <WorkspaceSwitcher currentId={ws.id} options={switcherOptions} /> : undefined
      }
      orgId={org.id}
      orgSlug={org.slug}
      impersonating={!!impersonating}
      hasManagerRole={hasManagerRole}
      hasNonLearnerSurface={hasNonLearnerSurface}
    >
      {children}
    </AppShell>
  );
}
