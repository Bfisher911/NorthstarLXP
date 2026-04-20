"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (next: number) => void;
  className?: string;
}) {
  const maxPage = Math.max(0, Math.ceil(total / pageSize) - 1);
  if (maxPage === 0) return null;
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  return (
    <div className={cn("flex items-center justify-between text-xs text-muted-foreground", className)}>
      <span>
        {from}–{to} of <span className="font-semibold text-foreground">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </Button>
        <span className="px-2 font-mono text-[11px] text-foreground">
          {page + 1} / {maxPage + 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.min(maxPage, page + 1))}
          disabled={page >= maxPage}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
