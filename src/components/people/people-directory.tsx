"use client";

import * as React from "react";
import { BellRing, Search, Send, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { BulkToolbar } from "@/components/ui/bulk-toolbar";
import { useToast } from "@/components/ui/toast";
import { cn, initials } from "@/lib/utils";
import type { UserRecord } from "@/lib/types";

type Facet = "all" | "admin" | "manager" | "learner";

export function PeopleDirectory({ users }: { users: UserRecord[] }) {
  const [query, setQuery] = React.useState("");
  const [facet, setFacet] = React.useState<Facet>("all");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const runAction = (verb: string) => {
    const n = selected.size;
    toast({
      title: `${verb} sent`,
      description: `${n} ${n === 1 ? "person" : "people"} will receive this action.`,
      variant: "success",
      action: {
        label: "Undo",
        onClick: () => {
          toast({ title: `${verb} undone`, variant: "default" });
        },
      },
    });
    clearSelection();
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (facet === "admin" && !u.roles.some((r) => r.role.includes("admin") || r.role === "workspace_author")) return false;
      if (facet === "manager" && !u.roles.some((r) => r.role === "manager")) return false;
      if (facet === "learner" && !u.roles.some((r) => r.role === "learner")) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.employee?.title?.toLowerCase().includes(q) ||
        u.employee?.department?.toLowerCase().includes(q) ||
        u.employee?.location?.toLowerCase().includes(q)
      );
    });
  }, [users, query, facet]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, title, department…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="inline-flex rounded-md border p-0.5 text-xs">
          {(["all", "admin", "manager", "learner"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFacet(f)}
              className={cn(
                "rounded px-2.5 py-1 capitalize transition",
                facet === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {users.length}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No people match those filters"
          description="Try a different keyword or switch the role facet."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-8 px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      className="h-3.5 w-3.5 accent-primary"
                      checked={filtered.length > 0 && filtered.every((u) => selected.has(u.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected(new Set(filtered.map((u) => u.id)));
                        } else {
                          clearSelection();
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Person</th>
                  <th className="px-4 py-3 text-left">Title / Department</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Roles</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className={cn(
                      "transition hover:bg-accent/30",
                      selected.has(u.id) && "bg-primary/5"
                    )}
                  >
                    <td className="w-8 px-3 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${u.name}`}
                        className="h-3.5 w-3.5 accent-primary"
                        checked={selected.has(u.id)}
                        onChange={() => toggle(u.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-[10px]">{initials(u.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{u.employee?.title ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.employee?.department ?? ""}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u.employee?.campus ?? u.employee?.location ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {r.role.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.employee?.status === "active" ? "success" : "outline"}>
                        {u.employee?.status ?? "active"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
      <BulkToolbar count={selected.size} onClear={clearSelection}>
        <Button size="sm" onClick={() => runAction("Assignment")}>
          <Send className="h-3.5 w-3.5" /> Assign training
        </Button>
        <Button size="sm" variant="outline" onClick={() => runAction("Reminder")}>
          <BellRing className="h-3.5 w-3.5" /> Send reminder
        </Button>
      </BulkToolbar>
    </div>
  );
}
