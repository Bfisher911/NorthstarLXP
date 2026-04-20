"use client";

import * as React from "react";
import { Check, ChevronDown, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { cn, initials, relativeDate } from "@/lib/utils";

export interface AiReviewItem {
  id: string;
  userName: string;
  userTitle?: string;
  courseTitle: string;
  confidence: number;
  createdAt: string;
  reason: string;
  evidence: string[];
}

type Decision = "pending" | "approved" | "rejected";

/**
 * Interactive AI suggestion queue with a confidence meter, expandable evidence,
 * and approve/reject actions that fire a toast + collapse the row.
 */
export function AiReviewQueue({ items }: { items: AiReviewItem[] }) {
  const [state, setState] = React.useState<Record<string, Decision>>({});
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const { toast } = useToast();

  const decide = (id: string, verdict: Decision, item: AiReviewItem) => {
    setState((prev) => ({ ...prev, [id]: verdict }));
    toast({
      title: verdict === "approved" ? "Assignment created" : "Suggestion dismissed",
      description:
        verdict === "approved"
          ? `${item.courseTitle} → ${item.userName}`
          : `${item.courseTitle} for ${item.userName} won't be suggested again.`,
      variant: verdict === "approved" ? "success" : "default",
      action: {
        label: "Undo",
        onClick: () =>
          setState((prev) => {
            const { [id]: _, ...rest } = prev;
            return rest;
          }),
      },
    });
  };

  const visible = items.filter((i) => state[i.id] !== "approved" && state[i.id] !== "rejected");

  return (
    <div className="divide-y">
      {visible.map((item) => {
        const isOpen = expanded === item.id;
        return (
          <div key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start">
            <Avatar>
              <AvatarFallback>{initials(item.userName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold">{item.userName}</span>
                {item.userTitle && (
                  <span className="text-xs text-muted-foreground">· {item.userTitle}</span>
                )}
                <span className="ml-auto text-xs text-muted-foreground">{relativeDate(item.createdAt)}</span>
              </div>
              <div className="mt-1 text-sm">
                Suggest assigning <span className="font-medium">{item.courseTitle}</span>
              </div>
              <ConfidenceMeter value={item.confidence} />
              <p className="mt-2 text-xs text-muted-foreground">
                <Sparkles className="mr-1 inline-block h-3 w-3 text-violet-500" />
                {item.reason}
              </p>
              <button
                type="button"
                onClick={() => setExpanded((cur) => (cur === item.id ? null : item.id))}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <ChevronDown
                  className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}
                />
                {isOpen ? "Hide evidence" : `Show ${item.evidence.length} evidence fields`}
              </button>
              {isOpen && (
                <div className="mt-2 space-y-1.5 rounded-md border bg-muted/30 p-3">
                  {item.evidence.map((e, i) => {
                    const [field, ...rest] = e.split(":");
                    const value = rest.join(":").trim();
                    const hasColon = e.includes(":");
                    return (
                      <div key={i} className="flex gap-2 text-xs">
                        {hasColon ? (
                          <>
                            <span className="min-w-[96px] font-medium text-muted-foreground">
                              {field}
                            </span>
                            <span className="font-mono">{value}</span>
                          </>
                        ) : (
                          <span>• {e}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex gap-2 sm:flex-col">
              <Button size="sm" className="h-8" onClick={() => decide(item.id, "approved", item)}>
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => decide(item.id, "rejected", item)}
              >
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
            </div>
          </div>
        );
      })}
      {visible.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          🎉 Nothing to review. Nice work.
        </div>
      )}
    </div>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    pct >= 85
      ? "from-emerald-500 to-teal-400 text-emerald-700 dark:text-emerald-300"
      : pct >= 65
      ? "from-northstar-500 to-violet-400 text-primary"
      : "from-amber-500 to-rose-500 text-amber-700 dark:text-amber-300";
  const label = pct >= 85 ? "High" : pct >= 65 ? "Medium" : "Low";
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${tone.split(" text-")[0]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <Badge variant="outline" className={cn("font-mono text-[10px]", tone.split(" ").slice(-2).join(" "))}>
        {pct}% · {label}
      </Badge>
    </div>
  );
}
