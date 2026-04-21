"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

export interface WorkspaceOption {
  id: string;
  name: string;
  emoji: string;
  href: string;
}

/**
 * Compact dropdown shown in the workspace shell scope line whenever the
 * signed-in user admins more than one workspace. Single-workspace admins
 * fall back to the plain scope label in the Topbar — nothing rendered.
 */
export function WorkspaceSwitcher({
  currentId,
  options,
}: {
  currentId: string;
  options: WorkspaceOption[];
}) {
  if (options.length <= 1) return null;
  const current = options.find((o) => o.id === currentId);
  return (
    <DropdownRoot>
      <DropdownTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground shadow-sm transition hover:border-primary/40 hover:text-foreground"
          aria-label="Switch workspace"
        >
          <span className="truncate">
            {current?.emoji} {current?.name}
          </span>
          <ChevronsUpDown className="h-3 w-3 shrink-0" />
        </button>
      </DropdownTrigger>
      <DropdownContent align="start" className="w-64">
        <DropdownLabel>Your workspaces</DropdownLabel>
        <DropdownSeparator />
        {options.map((o) => {
          const active = o.id === currentId;
          return (
            <DropdownItem key={o.id} asChild>
              <Link
                href={o.href}
                className={cn(
                  "flex w-full items-center gap-2",
                  active && "font-semibold text-primary"
                )}
              >
                <span className="text-base">{o.emoji}</span>
                <span className="flex-1 truncate">{o.name}</span>
                {active && <Check className="h-3.5 w-3.5" />}
              </Link>
            </DropdownItem>
          );
        })}
      </DropdownContent>
    </DropdownRoot>
  );
}
