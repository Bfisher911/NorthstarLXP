"use client";

import { Bell, LogOut, Moon, Search, Sun, UserCog } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { signOut, stopImpersonation } from "@/app/actions/session";

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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-6 backdrop-blur">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search courses, paths, learners, certificates…"
          />
        </div>
      </div>
      {impersonating && (
        <form action={stopImpersonation}>
          <Button variant="outline" size="sm" className="border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Exit impersonation
          </Button>
        </form>
      )}
      <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-4 w-4" />
      </Button>
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
