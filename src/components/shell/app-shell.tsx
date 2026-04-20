import { NorthstarLogo } from "@/components/brand/logo";
import { Sidebar, type NavGroup } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { Breadcrumbs } from "@/components/shell/breadcrumbs";
import { CommandPaletteProvider } from "@/components/shell/command-palette";
import { MobileNav } from "@/components/shell/mobile-nav";
import { ToastProvider } from "@/components/ui/toast";
import { ImpersonationBanner } from "@/components/shell/impersonation-banner";
import { buildCommandCatalog } from "@/lib/command-catalog";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppShell({
  groups,
  user,
  role,
  roleLabel,
  scopeLabel,
  orgId,
  orgSlug,
  impersonating,
  sidebarFooter,
  children,
}: {
  groups: NavGroup[];
  user: { id: string; name: string; email: string };
  role: Role;
  roleLabel: string;
  scopeLabel?: string;
  orgId?: string;
  orgSlug?: string;
  impersonating?: boolean;
  sidebarFooter?: React.ReactNode;
  children: React.ReactNode;
}) {
  const commands = buildCommandCatalog({ role, orgId, orgSlug });

  // Role-tinted accent — subtle gradient wash so you instantly know which hat
  // you're wearing. The colour tokens line up with the role accents in the
  // sign-in page.
  const roleAccent: Record<Role, string> = {
    super_admin: "from-violet-500/15",
    org_admin: "from-sky-500/12",
    workspace_admin: "from-emerald-500/12",
    workspace_author: "from-emerald-500/12",
    workspace_viewer: "from-muted",
    manager: "from-amber-500/12",
    learner: "from-northstar-500/12",
  };

  return (
    <ToastProvider>
      <CommandPaletteProvider items={commands}>
        <div className="flex h-screen w-full overflow-hidden">
          <div className="hidden md:flex">
            <Sidebar groups={groups} header={<NorthstarLogo />} footer={sidebarFooter} />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar
              user={user}
              roleLabel={roleLabel}
              scopeLabel={scopeLabel}
              impersonating={impersonating}
              mobileNav={<MobileNav groups={groups} sidebarFooter={sidebarFooter} />}
            />
            {impersonating && <ImpersonationBanner />}
            <main className="relative flex-1 overflow-y-auto scrollbar-thin bg-gradient-to-b from-background to-muted/20">
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-x-0 top-0 -z-0 h-72 bg-gradient-to-b to-transparent opacity-80",
                  roleAccent[role] ?? "from-northstar-500/10"
                )}
              />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-64 bg-star-field opacity-40" />
              <div className="relative z-10 mx-auto max-w-7xl p-6 lg:p-8 page-enter">
                <Breadcrumbs />
                {children}
              </div>
            </main>
          </div>
        </div>
      </CommandPaletteProvider>
    </ToastProvider>
  );
}
