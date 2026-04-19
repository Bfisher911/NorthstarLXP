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
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-gradient-to-b from-background to-muted/20">
          <div className="mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
