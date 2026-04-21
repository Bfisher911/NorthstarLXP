import {
  Activity,
  Building2,
  CreditCard,
  Database,
  Home,
  LifeBuoy,
  ScrollText,
  UserCog,
} from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import type { NavGroup } from "@/components/shell/sidebar";
import { requireSession, highestRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, impersonating } = await requireSession();
  if (highestRole(user) !== "super_admin") redirect("/");

  const groups: NavGroup[] = [
    {
      items: [
        { title: "Platform overview", href: "/admin", icon: <Home />, exact: true },
        { title: "Organizations", href: "/admin/organizations", icon: <Building2 /> },
        { title: "Activity & incidents", href: "/admin/activity", icon: <Activity /> },
        { title: "Billing & usage", href: "/admin/billing", icon: <CreditCard /> },
      ],
    },
    {
      label: "Platform tools",
      items: [
        { title: "Impersonation", href: "/admin/impersonation", icon: <UserCog /> },
        { title: "Audit log", href: "/admin/audit", icon: <ScrollText /> },
        { title: "Feed sync", href: "/admin/sync", icon: <Database /> },
        { title: "Support", href: "/admin/support", icon: <LifeBuoy /> },
      ],
    },
  ];
  return (
    <AppShell
      groups={groups}
      user={{ id: user.id, name: user.name, email: user.email }}
      role="super_admin"
      roleLabel="Super Admin"
      scopeLabel="Platform"
      impersonating={!!impersonating}
      hasNonLearnerSurface={true}
    >
      {children}
    </AppShell>
  );
}
