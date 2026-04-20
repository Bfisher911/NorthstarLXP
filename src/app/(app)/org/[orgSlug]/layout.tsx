import { notFound } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Building2,
  Compass,
  Home,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import type { NavGroup } from "@/components/shell/sidebar";
import { requireSession } from "@/lib/auth";
import { getOrgBySlug } from "@/lib/data";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const { user, impersonating } = await requireSession();

  const base = `/org/${orgSlug}`;
  const groups: NavGroup[] = [
    {
      items: [
        { title: "Overview", href: base, icon: <Home />, exact: true },
        { title: "Workspaces", href: `${base}/workspaces`, icon: <Building2 /> },
        { title: "Org learning paths", href: `${base}/paths`, icon: <Compass /> },
        { title: "Catalog", href: `${base}/catalog`, icon: <BookOpen /> },
        { title: "People", href: `${base}/people`, icon: <Users /> },
      ],
    },
    {
      label: "Insight",
      items: [
        { title: "Reports", href: `${base}/reports`, icon: <BarChart3 /> },
        { title: "Compliance", href: `${base}/compliance`, icon: <ShieldCheck /> },
        { title: "Audit log", href: `${base}/audit`, icon: <ScrollText /> },
      ],
    },
    {
      label: "Org",
      items: [{ title: "Settings", href: `${base}/settings`, icon: <Settings /> }],
    },
  ];

  return (
    <AppShell
      groups={groups}
      user={{ id: user.id, name: user.name, email: user.email }}
      role="org_admin"
      roleLabel="Org Admin"
      scopeLabel={org.name}
      orgId={org.id}
      orgSlug={org.slug}
      impersonating={!!impersonating}
    >
      {children}
    </AppShell>
  );
}
