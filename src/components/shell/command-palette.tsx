"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Award,
  BookOpen,
  Building2,
  Compass,
  Cpu,
  FileCheck2,
  Home,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useKeyboardShortcut } from "@/lib/hooks";

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  keywords?: string[];
  group?: string;
  icon?: React.ReactNode;
}

interface CommandContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

export function useCommandPalette() {
  return React.useContext(CommandContext);
}

const iconFor = (group?: string): React.ReactNode => {
  switch (group) {
    case "Courses":
      return <BookOpen className="h-4 w-4" />;
    case "Paths":
      return <Compass className="h-4 w-4" />;
    case "People":
      return <Users className="h-4 w-4" />;
    case "Workspaces":
      return <Sparkles className="h-4 w-4" />;
    case "Organizations":
      return <Building2 className="h-4 w-4" />;
    case "Navigation":
      return <Home className="h-4 w-4" />;
    case "Compliance":
      return <ShieldCheck className="h-4 w-4" />;
    case "Assignments":
      return <Send className="h-4 w-4" />;
    case "AI":
      return <Cpu className="h-4 w-4" />;
    case "Surveys":
      return <FileCheck2 className="h-4 w-4" />;
    case "Credentials":
      return <Award className="h-4 w-4" />;
    default:
      return <Search className="h-4 w-4" />;
  }
};

export function CommandPaletteProvider({
  items,
  children,
}: {
  items: CommandItem[];
  children: React.ReactNode;
}) {
  const [isOpen, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const open = React.useCallback(() => setOpen(true), []);
  const close = React.useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);
  const toggle = React.useCallback(() => setOpen((o) => !o), []);

  useKeyboardShortcut("k", (e) => {
    e.preventDefault();
    toggle();
  }, { mod: true });

  // Fuzzy filter — simple substring + token match on title + subtitle + keywords.
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 40);
    const tokens = q.split(/\s+/);
    const scored: Array<{ item: CommandItem; score: number }> = [];
    for (const item of items) {
      const hay = [item.title, item.subtitle ?? "", ...(item.keywords ?? [])]
        .join(" ")
        .toLowerCase();
      let score = 0;
      let miss = false;
      for (const t of tokens) {
        const i = hay.indexOf(t);
        if (i < 0) {
          miss = true;
          break;
        }
        score += t.length / (i + 1);
      }
      if (!miss) scored.push({ item, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 40).map((s) => s.item);
  }, [items, query]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  // Group items by their group label, preserving filter order.
  const grouped = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const group = item.group ?? "Results";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(item);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const flat = filtered;

  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-cmd-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      const chosen = flat[activeIndex];
      if (chosen) {
        router.push(chosen.href);
        close();
      }
    }
  };

  return (
    <CommandContext.Provider value={{ open, close, toggle, isOpen }}>
      {children}
      <Dialog.Root open={isOpen} onOpenChange={(o) => (o ? open() : close())}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
          <Dialog.Content
            className="fixed left-1/2 top-[18%] z-[90] w-[92vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              inputRef.current?.focus();
            }}
          >
            <Dialog.Title className="sr-only">Command palette</Dialog.Title>
            <Dialog.Description className="sr-only">
              Search for any course, path, person, workspace, or page.
            </Dialog.Description>
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Jump to course, path, person, or page…"
                className="h-7 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                Esc
              </kbd>
              <Dialog.Close className="rounded p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <div
              ref={listRef}
              className="max-h-[60vh] overflow-y-auto scrollbar-thin p-2"
            >
              {flat.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Nothing matches &ldquo;{query}&rdquo;. Try a different keyword.
                </div>
              ) : (
                (() => {
                  let idx = -1;
                  return grouped.map(([group, items]) => (
                    <div key={group} className="mb-2">
                      <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {group}
                      </div>
                      <div className="space-y-0.5">
                        {items.map((item) => {
                          idx += 1;
                          const active = idx === activeIndex;
                          const myIndex = idx;
                          return (
                            <button
                              key={item.id}
                              data-cmd-index={myIndex}
                              onMouseEnter={() => setActiveIndex(myIndex)}
                              onClick={() => {
                                router.push(item.href);
                                close();
                              }}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition",
                                active ? "bg-accent" : "hover:bg-accent/60"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-7 w-7 items-center justify-center rounded-md",
                                  active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                                )}
                              >
                                {item.icon ?? iconFor(item.group)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium">{item.title}</div>
                                {item.subtitle && (
                                  <div className="truncate text-xs text-muted-foreground">
                                    {item.subtitle}
                                  </div>
                                )}
                              </div>
                              {active && (
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                  ↵ Enter
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>

            <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>↑↓ navigate · ↵ open · esc close</span>
              <span>{flat.length} results</span>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </CommandContext.Provider>
  );
}
