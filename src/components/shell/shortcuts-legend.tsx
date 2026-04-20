"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcut } from "@/lib/hooks";
import { useCommandPalette } from "@/components/shell/command-palette";

/**
 * Keyboard shortcuts dialog. Opens on `?` (unless focus is in an input), and
 * the palette's ⌘K binding still works independently.
 */
export function ShortcutsLegend() {
  const [open, setOpen] = React.useState(false);
  const palette = useCommandPalette();

  useKeyboardShortcut("?", (e) => {
    const target = e.target as HTMLElement | null;
    if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
    if (target?.isContentEditable) return;
    e.preventDefault();
    setOpen(true);
  });

  const shortcuts: Array<{ group: string; rows: Array<[string[], string]> }> = [
    {
      group: "Navigation",
      rows: [
        [["⌘", "K"], "Open the command palette"],
        [["?"], "Show this shortcuts list"],
        [["Esc"], "Close any open dialog"],
      ],
    },
    {
      group: "Command palette",
      rows: [
        [["↑", "↓"], "Highlight previous / next result"],
        [["↵"], "Open the selected result"],
        [["⌘", "K"], "Close palette"],
      ],
    },
    {
      group: "Journey map",
      rows: [
        [["Click"], "Focus: dim everything outside a node's chain"],
        [["Click again"], "Reset focus"],
      ],
    },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Keyboard shortcuts">
          <Keyboard className="h-4 w-4" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-background/70 backdrop-blur data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border bg-popover shadow-2xl data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="flex items-center gap-2 text-sm font-semibold">
              <Keyboard className="h-4 w-4 text-primary" /> Keyboard shortcuts
            </Dialog.Title>
            <Dialog.Close className="rounded p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="space-y-5 p-4">
            {shortcuts.map((group) => (
              <div key={group.group}>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.group}
                </div>
                <ul className="divide-y">
                  {group.rows.map(([keys, desc], i) => (
                    <li key={i} className="flex items-center gap-3 py-2 text-sm">
                      <div className="flex items-center gap-1">
                        {keys.map((k, ki) => (
                          <React.Fragment key={ki}>
                            <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border bg-muted px-1.5 font-mono text-[11px] font-semibold text-foreground">
                              {k}
                            </kbd>
                            {ki < keys.length - 1 && (
                              <span className="text-xs text-muted-foreground">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <span className="text-muted-foreground">{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Tip: hit{" "}
              <kbd className="inline-flex rounded border bg-background px-1 font-mono text-[10px]">⌘K</kbd>{" "}
              from anywhere to open the command palette
              {palette && " "}and jump to any course, path, or person.
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
