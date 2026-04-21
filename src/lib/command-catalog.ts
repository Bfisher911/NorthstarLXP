import type { CommandItem } from "@/components/shell/command-palette";
import type { Role } from "@/lib/types";
import {
  courses,
  learningPaths,
  organizations,
  users,
  workspaces,
} from "@/lib/data";

/**
 * Build the set of commands relevant to the signed-in user's scope. The
 * catalog is intentionally broad — the palette's fuzzy match does the
 * narrowing.
 */
export function buildCommandCatalog({
  role,
  orgId,
  orgSlug,
}: {
  role: Role;
  orgId?: string;
  orgSlug?: string;
}): CommandItem[] {
  const items: CommandItem[] = [];

  // --- Navigation shortcuts per role ---
  if (role === "super_admin") {
    items.push(
      { id: "nav_admin", title: "Platform overview", href: "/admin", group: "Navigation" },
      { id: "nav_orgs", title: "All organizations", href: "/admin/organizations", group: "Navigation" },
      { id: "nav_support", title: "Support queue", href: "/admin/support", group: "Navigation" },
      { id: "nav_sync", title: "Feed sync", href: "/admin/sync", group: "Navigation" },
      { id: "nav_billing", title: "Billing & usage", href: "/admin/billing", group: "Navigation" },
      { id: "nav_audit", title: "Platform audit log", href: "/admin/audit", group: "Navigation" },
      { id: "nav_impersonation", title: "Impersonate a user", href: "/admin/impersonation", group: "Navigation" }
    );
  }
  if (role === "learner") {
    items.push(
      { id: "nav_learner_home", title: "My dashboard", href: "/learner", group: "Navigation" },
      { id: "nav_journey", title: "My journey map", href: "/learner/journey", group: "Navigation" },
      { id: "nav_training", title: "My training", href: "/learner/training", group: "Navigation" },
      { id: "nav_library", title: "Training library", href: "/learner/library", group: "Navigation" },
      { id: "nav_certs", title: "My certificates", href: "/learner/certificates", group: "Navigation" },
      { id: "nav_dev", title: "Optional development", href: "/learner/development", group: "Navigation" },
      { id: "nav_bookmarks", title: "Bookmarks", href: "/learner/bookmarks", group: "Navigation" }
    );
  }
  if (role === "manager") {
    items.push(
      { id: "nav_mgr_home", title: "Team overview", href: "/manager", group: "Navigation" },
      { id: "nav_mgr_team", title: "Direct reports", href: "/manager/team", group: "Navigation" },
      { id: "nav_mgr_comp", title: "Team compliance", href: "/manager/compliance", group: "Navigation" },
      { id: "nav_mgr_rem", title: "Reminders sent", href: "/manager/reminders", group: "Navigation" }
    );
  }
  if (orgSlug) {
    items.push(
      { id: `nav_org_${orgSlug}`, title: "Organization overview", href: `/org/${orgSlug}`, group: "Navigation" },
      { id: `nav_org_ws_${orgSlug}`, title: "Workspaces", href: `/org/${orgSlug}/workspaces`, group: "Navigation" },
      { id: `nav_org_paths_${orgSlug}`, title: "Org learning paths", href: `/org/${orgSlug}/paths`, group: "Navigation" },
      { id: `nav_org_cat_${orgSlug}`, title: "Catalog", href: `/org/${orgSlug}/catalog`, group: "Navigation" },
      { id: `nav_org_people_${orgSlug}`, title: "People directory", href: `/org/${orgSlug}/people`, group: "Navigation" },
      { id: `nav_org_reports_${orgSlug}`, title: "Reports", href: `/org/${orgSlug}/reports`, group: "Navigation" },
      { id: `nav_org_comp_${orgSlug}`, title: "Compliance snapshot", href: `/org/${orgSlug}/compliance`, group: "Navigation" },
      { id: `nav_org_audit_${orgSlug}`, title: "Audit log", href: `/org/${orgSlug}/audit`, group: "Navigation" }
    );
  }

  // --- Organizations (super admin) ---
  if (role === "super_admin") {
    for (const org of organizations) {
      items.push({
        id: `org_${org.id}`,
        title: org.name,
        subtitle: `${org.industry} · ${org.plan} plan`,
        href: `/org/${org.slug}`,
        group: "Organizations",
        keywords: [org.slug, org.industry, org.plan],
      });
    }
  }

  // --- Workspaces ---
  const wsScope = orgId
    ? workspaces.filter((w) => w.orgId === orgId)
    : role === "super_admin"
    ? workspaces
    : [];
  for (const ws of wsScope) {
    const o = organizations.find((x) => x.id === ws.orgId);
    if (!o) continue;
    items.push({
      id: `ws_${ws.id}`,
      title: ws.name,
      subtitle: `${o.name} · ${ws.courseCount} courses · ${ws.pathCount} paths`,
      href: `/org/${o.slug}/w/${ws.slug}`,
      group: "Workspaces",
      keywords: [ws.department, ws.slug, o.slug],
    });
  }

  // --- Courses ---
  const courseScope = orgId ? courses.filter((c) => c.orgId === orgId) : courses;
  for (const c of courseScope) {
    const o = organizations.find((x) => x.id === c.orgId);
    const ws = workspaces.find((w) => w.id === c.workspaceId);
    if (!o || !ws) continue;
    // Learners get a direct link to the course player; admins/managers see it in workspace context.
    const href =
      role === "learner"
        ? `/learner/course/${c.id}`
        : `/org/${o.slug}/w/${ws.slug}/courses/${c.id}`;
    items.push({
      id: `course_${c.id}`,
      title: c.title,
      subtitle: `${c.category} · ${ws.name}`,
      href,
      group: "Courses",
      keywords: [c.type, ...(c.tags ?? [])],
    });
  }

  // --- Paths ---
  const pathScope = orgId ? learningPaths.filter((p) => p.orgId === orgId) : learningPaths;
  for (const p of pathScope) {
    const o = organizations.find((x) => x.id === p.orgId);
    if (!o) continue;
    const href = p.workspaceId
      ? `/org/${o.slug}/w/${workspaces.find((w) => w.id === p.workspaceId)?.slug}/paths/${p.id}`
      : `/org/${o.slug}/paths/${p.id}`;
    items.push({
      id: `path_${p.id}`,
      title: p.name,
      subtitle: `${o.name} · ${p.assignedCount.toLocaleString()} learners`,
      href,
      group: "Paths",
    });
  }

  // --- People (org-scoped for org admins + super admin) ---
  if (role === "org_admin" || role === "super_admin") {
    const peopleScope = orgId ? users.filter((u) => u.orgId === orgId) : users;
    for (const u of peopleScope) {
      items.push({
        id: `user_${u.id}`,
        title: u.name,
        subtitle: u.employee?.title ?? u.email,
        href: orgSlug ? `/org/${orgSlug}/people` : "/admin/organizations",
        group: "People",
        keywords: [u.email, u.employee?.department ?? "", u.employee?.location ?? ""],
      });
    }
  }

  // --- Quick actions ---
  if (orgSlug) {
    items.push(
      {
        id: "act_new_course",
        title: "Create a new course",
        subtitle: "Pick a type and save a draft",
        href: `/org/${orgSlug}/workspaces`,
        group: "Quick actions",
      },
      {
        id: "act_new_path",
        title: "Build a new org-wide learning path",
        href: `/org/${orgSlug}/paths/new`,
        group: "Quick actions",
      },
      {
        id: "act_reports",
        title: "Run a completion report",
        href: `/org/${orgSlug}/reports`,
        group: "Quick actions",
      }
    );
  }

  return items;
}
