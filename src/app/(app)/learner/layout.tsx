import { Award, BookOpen, Compass, Home, Sparkles, Star } from "lucide-react";
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
        { title: "Development", href: "/learner/development", icon: <Sparkles /> },
        { title: "Certificates", href: "/learner/certificates", icon: <Award /> },
        { title: "Bookmarks", href: "/learner/bookmarks", icon: <Star /> },
      ],
    },
  ];
  return (
    <AppShell
      groups={groups}
      user={{ id: user.id, name: user.name, email: user.email }}
      role="learner"
      roleLabel="Learner"
      orgId={user.orgId}
      impersonating={!!impersonating}
    >
      {children}
    </AppShell>
  );
}
