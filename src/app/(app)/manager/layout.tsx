import { Bell, Home, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import type { NavGroup } from "@/components/shell/sidebar";
import { canManageAsManager, requireSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const { user, impersonating } = await requireSession();
  if (!canManageAsManager(user)) redirect("/learner");
  const groups: NavGroup[] = [
    {
      items: [
        { title: "Team overview", href: "/manager", icon: <Home />, exact: true },
        { title: "Direct reports", href: "/manager/team", icon: <Users /> },
        { title: "Compliance health", href: "/manager/compliance", icon: <ShieldCheck /> },
        { title: "Reminders sent", href: "/manager/reminders", icon: <Bell /> },
      ],
    },
  ];
  return (
    <AppShell
      groups={groups}
      user={{ id: user.id, name: user.name, email: user.email }}
      role="manager"
      roleLabel="Manager"
      scopeLabel="Team"
      orgId={user.orgId}
      impersonating={!!impersonating}
      hasNonLearnerSurface={true}
    >
      {children}
    </AppShell>
  );
}
