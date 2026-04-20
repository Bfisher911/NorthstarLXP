"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  exact?: boolean;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export function Sidebar({
  groups,
  header,
  footer,
}: {
  groups: NavGroup[];
  header: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <aside className="relative flex h-screen w-64 shrink-0 flex-col border-r bg-card/70 backdrop-blur">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/8 to-transparent"
      />
      <div className="relative flex h-16 items-center border-b px-5">{header}</div>
      <nav className="relative flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {groups.map((group, gi) => (
          <div key={gi} className="mb-5">
            {group.label && (
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center transition-transform [&_svg]:h-4 [&_svg]:w-4",
                          active ? "scale-110" : "group-hover:scale-105"
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.title}</span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                            active
                              ? "bg-primary/25 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {active && (
                        <span
                          aria-hidden
                          className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/60"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      {footer && <div className="border-t p-3">{footer}</div>}
    </aside>
  );
}
