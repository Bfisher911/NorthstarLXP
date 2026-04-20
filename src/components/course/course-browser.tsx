"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, relativeDate } from "@/lib/utils";
import type { Course } from "@/lib/types";

type Browseable = Pick<
  Course,
  | "id"
  | "title"
  | "summary"
  | "type"
  | "category"
  | "tags"
  | "durationMinutes"
  | "thumbnailColor"
  | "thumbnailEmoji"
  | "updatedAt"
  | "published"
  | "shareToOrg"
  | "required"
>;

export function CourseBrowser({
  courses,
  hrefPrefix,
  className,
}: {
  courses: Browseable[];
  /** Each card links to `${hrefPrefix}/${course.id}` */
  hrefPrefix: string;
  className?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string | null>(null);
  const [type, setType] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"all" | "published" | "draft">("all");

  const categories = React.useMemo(
    () => Array.from(new Set(courses.map((c) => c.category))).sort(),
    [courses]
  );
  const types = React.useMemo(
    () => Array.from(new Set(courses.map((c) => c.type))).sort(),
    [courses]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (category && c.category !== category) return false;
      if (type && c.type !== type) return false;
      if (status === "published" && !c.published) return false;
      if (status === "draft" && c.published) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [courses, query, category, type, status]);

  const clear = () => {
    setQuery("");
    setCategory(null);
    setType(null);
    setStatus("all");
  };

  const hasFilters = !!query || !!category || !!type || status !== "all";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search title, summary, or tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ChipSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={categories}
        />
        <ChipSelect
          label="Type"
          value={type}
          onChange={setType}
          options={types}
          formatOption={(t) => t.replace("_", " ")}
        />
        <div className="inline-flex rounded-md border p-0.5 text-xs">
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded px-2 py-1 capitalize transition",
                status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {hasFilters && (
          <Button size="sm" variant="ghost" onClick={clear}>
            Clear
          </Button>
        )}
        <div className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {courses.length}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No courses match those filters"
          description="Try clearing filters or searching a different keyword."
          action={
            <Button variant="outline" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="group overflow-hidden card-hover">
              <div
                className={cn(
                  "relative flex h-32 items-center justify-center bg-gradient-to-br text-4xl text-white",
                  c.thumbnailColor
                )}
              >
                <div aria-hidden className="absolute inset-0 bg-star-field opacity-20" />
                <span className="relative">{c.thumbnailEmoji}</span>
                {c.shareToOrg && (
                  <Badge
                    variant="outline"
                    className="absolute right-2 top-2 border-white/30 bg-white/10 text-white"
                  >
                    Shared org-wide
                  </Badge>
                )}
              </div>
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {c.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {c.type.replace("_", " ")}
                  </Badge>
                  {c.required && <Badge variant="info" className="text-[10px]">Required</Badge>}
                  {!c.published && <Badge variant="warning" className="text-[10px]">Draft</Badge>}
                </div>
                <div className="line-clamp-2 font-semibold leading-snug">{c.title}</div>
                <div className="line-clamp-2 text-xs text-muted-foreground">{c.summary}</div>
                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <span>Updated {relativeDate(c.updatedAt)}</span>
                  <span>{c.durationMinutes} min</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`${hrefPrefix.replace(/\/$/, "")}/${c.id}`}>
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ChipSelect({
  label,
  value,
  onChange,
  options,
  formatOption,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: string[];
  formatOption?: (v: string) => string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className={cn(value && "border-primary/60 bg-primary/5 text-primary")}
      >
        {label}
        {value && <span className="ml-1 font-semibold">· {formatOption ? formatOption(value) : value}</span>}
      </Button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 shadow-lg">
          <button
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center rounded px-2 py-1.5 text-left text-sm transition",
              !value ? "bg-accent" : "hover:bg-accent/60"
            )}
          >
            All
          </button>
          {options.map((o) => (
            <button
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center rounded px-2 py-1.5 text-left text-sm capitalize transition",
                value === o ? "bg-accent" : "hover:bg-accent/60"
              )}
            >
              {formatOption ? formatOption(o) : o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
