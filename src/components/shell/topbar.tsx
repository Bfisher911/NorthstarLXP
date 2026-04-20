"use client";

import { Bell, LogOut, Moon, Search, Sun, UserCog } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { initials } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { signOut } from "@/app/actions/session";
import { useCommandPalette } from "@/components/shell/command-palette";

export function Topbar({
  user,
  roleLabel,
  scopeLabel,
  impersonating,
}: {
  user: { id: string; name: string; email: string };
  roleLabel: string;
  scopeLabel?: string;
  impersonating?: boolean;
}) {
  const { theme, toggle } = useTheme();
  const palette = useCommandPalette();

  void impersonating; // banner is rendered in AppShell now

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/75 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center gap-2">
        <button
          type="button"
          onClick={() => palette?.open()}
          className="group relative inline-flex h-9 w-full max-w-sm items-center gap-2 rounded-md border bg-background px-3 text-left text-sm text-muted-foreground shadow-sm transition hover:border-primary/40 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Jump to anything…</span>
          <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
            ⌘K
          </kbd>
        </button>
      </div>
      <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <DropdownRoot>
        <DropdownTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </Button>
        </DropdownTrigger>
        <DropdownContent align="end" className="w-80">
          <DropdownLabel>Notifications</DropdownLabel>
          <DropdownSeparator />
          <div className="space-y-2 p-2">
            <div className="rounded-md border bg-card p-3">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="warning">Expiring</Badge>
                <span className="ml-auto text-muted-foreground">2h ago</span>
              </div>
              <div className="mt-1.5 text-sm font-medium">Nadia Brooks — Fire Safety expires in 5 days</div>
            </div>
            <div className="rounded-md border bg-card p-3">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="info">AI review</Badge>
                <span className="ml-auto text-muted-foreground">Today</span>
              </div>
              <div className="mt-1.5 text-sm font-medium">3 new Bloodborne Pathogens suggestions</div>
            </div>
            <div className="rounded-md border bg-card p-3">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="destructive">Overdue</Badge>
                <span className="ml-auto text-muted-foreground">Yesterday</span>
              </div>
              <div className="mt-1.5 text-sm font-medium">4 learners on your team are overdue</div>
            </div>
          </div>
        </DropdownContent>
      </DropdownRoot>
      <DropdownRoot>
        <DropdownTrigger asChild>
          <button className="flex items-center gap-2 rounded-full border bg-card px-1.5 py-1 pr-3 text-left transition hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <div className="text-sm font-medium leading-none">{user.name}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {roleLabel}
                {scopeLabel ? ` · ${scopeLabel}` : ""}
              </div>
            </div>
          </button>
        </DropdownTrigger>
        <DropdownContent align="end" className="w-60">
          <DropdownLabel>{user.email}</DropdownLabel>
          <DropdownSeparator />
          <DropdownItem asChild>
            <a href="/learner" className="flex w-full items-center gap-2">
              <UserCog className="h-4 w-4" /> Switch to learner view
            </a>
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem asChild>
            <form action={signOut} className="w-full">
              <button className="flex w-full items-center gap-2">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </form>
          </DropdownItem>
        </DropdownContent>
      </DropdownRoot>
    </header>
  );
}
