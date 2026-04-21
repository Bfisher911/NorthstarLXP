"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { BookmarkButton } from "@/components/learner/bookmark-button";
import { CourseThumbnail } from "@/components/course/course-thumbnail";
import { cn } from "@/lib/utils";

export interface LibraryRow {
  id: string;
  title: string;
  summary: string;
  category: string;
  type: string;
  tags: readonly string[];
  durationMinutes: number;
  thumbnailColor: string;
  thumbnailEmoji: string;
  required: boolean;
  bookmarked: boolean;
  assigned: boolean;
}

type Facet = "all" | "assigned" | "not_assigned" | "bookmarked";

export function LibraryBrowser({
  userId,
  rows,
}: {
  userId: string;
  rows: LibraryRow[];
}) {
  const [query, setQuery] = React.useState("");
  const [facet, setFacet] = React.useState<Facet>("all");
  const [category, setCategory] = React.useState<string | null>(null);

  const categories = React.useMemo(
    () => Array.from(new Set(rows.map((r) => r.category))).sort(),
    [rows]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (facet === "assigned" && !r.assigned) return false;
      if (facet === "not_assigned" && r.assigned) return false;
      if (facet === "bookmarked" && !r.bookmarked) return false;
      if (category && r.category !== category) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [rows, query, facet, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search title, summary, tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="inline-flex rounded-md border p-0.5 text-xs">
          {([
            ["all", "All"],
            ["not_assigned", "Not assigned"],
            ["assigned", "Assigned"],
            ["bookmarked", "Bookmarked"],
          ] as Array<[Facet, string]>).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFacet(value)}
              className={cn(
                "rounded px-2.5 py-1 transition",
                facet === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={category ?? ""}
          onChange={(e) => setCategory(e.target.value || null)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {rows.length}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No courses match those filters"
          description="Try clearing filters or searching a different keyword."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setFacet("all");
                setCategory(null);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((row) => (
            <Card key={row.id} className="group overflow-hidden card-hover">
              <div className="relative">
                <CourseThumbnail
                  id={row.id}
                  gradientClass={row.thumbnailColor}
                  emoji={row.thumbnailEmoji}
                  className="h-32"
                />
                <div className="absolute right-2 top-2">
                  <BookmarkButton
                    userId={userId}
                    courseId={row.id}
                    courseTitle={row.title}
                    initialBookmarked={row.bookmarked}
                    variant="outline"
                    iconOnly
                  />
                </div>
                {row.assigned && (
                  <Badge
                    variant="outline"
                    className="absolute left-2 top-2 gap-1 border-emerald-300/50 bg-emerald-500/80 text-white shadow-sm"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Assigned
                  </Badge>
                )}
              </div>
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {row.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {row.type.replace("_", " ")}
                  </Badge>
                  {row.required && (
                    <Badge variant="info" className="text-[10px]">
                      Required
                    </Badge>
                  )}
                </div>
                <div className="line-clamp-2 font-semibold leading-snug">
                  {row.title}
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {row.summary}
                </p>
                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <span>{row.durationMinutes} min</span>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/learner/course/${row.id}`}>Open</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
