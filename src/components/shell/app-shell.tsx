import { NorthstarLogo } from "@/components/brand/logo";
import { Sidebar, type NavGroup } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export function AppShell({
  groups,
  user,
  roleLabel,
  scopeLabel,
  impersonating,
  sidebarFooter,
  children,
}: {
  groups: NavGroup[];
  user: { id: string; name: string; email: string };
  roleLabel: string;
  scopeLabel?: string;
  impersonating?: boolean;
  sidebarFooter?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        groups={groups}
        header={<NorthstarLogo />}
        footer={sidebarFooter}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          user={user}
          roleLabel={roleLabel}
          scopeLabel={scopeLabel}
          impersonating={impersonating}
        />
        <main className="relative flex-1 overflow-y-auto scrollbar-thin bg-gradient-to-b from-background to-muted/20">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-64 bg-aurora opacity-60" />
          <div className="relative z-10 mx-auto max-w-7xl p-6 lg:p-8 page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}
