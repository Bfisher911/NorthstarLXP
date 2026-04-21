import { Award, BookOpen, Compass, Home, Library, Sparkles, Star } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import type { NavGroup } from "@/components/shell/sidebar";
import { requireSession } from "@/lib/auth";

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const { user, impersonating } = await requireSession();
  const groups: NavGroup[] = [
    {
      items: [
        { title: "Home", href: "/learner", icon: <Home />, exact: true },
        { title: "My Journey", href: "/learner/journey", icon: <Compass /> },
        { title: "My Training", href: "/learner/training", icon: <BookOpen /> },
      ],
    },
    {
      label: "Explore",
      items: [
        { title: "Training library", href: "/learner/library", icon: <Library /> },
        { title: "Development", href: "/learner/development", icon: <Sparkles /> },
        { title: "Bookmarks", href: "/learner/bookmarks", icon: <Star /> },
        { title: "Certificates", href: "/learner/certificates", icon: <Award /> },
      ],
    },
  ];
  const hasManagerRole = user.roles.some((r) => r.role === "manager");
  const hasNonLearnerSurface = user.roles.some((r) =>
    ["manager", "workspace_admin", "workspace_author", "workspace_viewer", "org_admin", "super_admin"].includes(r.role)
  );

  return (
    <AppShell
      groups={groups}
      user={{ id: user.id, name: user.name, email: user.email }}
      role="learner"
      roleLabel="Learner"
      orgId={user.orgId}
      impersonating={!!impersonating}
      hasManagerRole={hasManagerRole}
      hasNonLearnerSurface={hasNonLearnerSurface}
    >
      {children}
    </AppShell>
  );
}
