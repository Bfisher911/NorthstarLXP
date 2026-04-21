"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

/**
 * Lightweight breadcrumbs derived from the URL. Segments are prettified to
 * title case. IDs and slugs that don't resolve to human labels are skipped
 * (e.g. `c_hipaa_core` → "Course"). This keeps things simple without needing
 * every page to declare its own breadcrumb manifest.
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname) return null;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return null;

  const prettyOverrides: Record<string, string> = {
    admin: "Platform",
    learner: "Learning",
    manager: "Team",
    org: "Organization",
    w: "Workspace",
    courses: "Courses",
    paths: "Paths",
    course: "My Training",
    reports: "Reports",
    audit: "Audit",
    compliance: "Compliance",
    support: "Support",
    sync: "Feed sync",
    impersonation: "Impersonation",
    organizations: "Organizations",
    activity: "Activity",
    billing: "Billing",
    people: "People",
    catalog: "Catalog",
    settings: "Settings",
    new: "New",
    edit: "Edit",
    ai: "AI review",
    surveys: "Surveys",
    groups: "Smart groups",
    assignments: "Assignments",
    notifications: "Notifications",
    certificates: "Certificates",
    development: "Development",
    bookmarks: "Bookmarks",
    journey: "Journey map",
    training: "My Training",
    library: "Training library",
    survey: "Survey",
    team: "Team",
    reminders: "Reminders",
    workspaces: "Workspaces",
  };

  const crumbs: { label: string; href: string | null }[] = [];
  let href = "";
  parts.forEach((part, i) => {
    href += "/" + part;
    const isLast = i === parts.length - 1;
    // Skip opaque IDs / slugs unless it's the last segment (then show a readable fallback)
    const looksLikeId =
      /^[a-z]+_[a-z0-9_-]+$/i.test(part) || /^[A-Za-z0-9]{15,}$/.test(part);
    if (looksLikeId && !isLast) return;

    let label: string;
    if (prettyOverrides[part]) {
      label = prettyOverrides[part];
    } else if (looksLikeId) {
      // Convert e.g. "c_hipaa_core" → "Hipaa core"
      const trimmed = part.includes("_") ? part.slice(part.indexOf("_") + 1) : part;
      label = trimmed
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    } else {
      label = part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }

    crumbs.push({ label, href: isLast ? null : href });
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 hidden items-center gap-1 text-xs text-muted-foreground sm:flex"
    >
      <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
        <Home className="h-3 w-3" />
      </Link>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          {c.href ? (
            <Link href={c.href} className="hover:text-foreground">
              {c.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{c.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
