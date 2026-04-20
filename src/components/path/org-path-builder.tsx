"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Compass, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createPath } from "@/app/actions/mutations";
import { cn } from "@/lib/utils";

export interface CatalogCourse {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  thumbnailColor: string;
  thumbnailEmoji: string;
  sourceName: string;
}

export function OrgPathBuilder({
  catalog,
  backHref,
  orgId,
}: {
  catalog: CatalogCourse[];
  backHref: string;
  orgId: string;
}) {
  const [name, setName] = React.useState("");
  const [audience, setAudience] = React.useState("");
  const [credential, setCredential] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [saved, setSaved] = React.useState(false);
  const [createdId, setCreatedId] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const selectedCourses = selected
    .map((id) => catalog.find((c) => c.id === id))
    .filter((c): c is CatalogCourse => !!c);
  const totalMinutes = selectedCourses.reduce((s, c) => s + c.durationMinutes, 0);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  if (saved) {
    return (
      <Card className="mx-auto max-w-2xl border-emerald-500/40 bg-emerald-500/5">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Path created</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            <strong className="text-foreground">{name}</strong> was created with{" "}
            <strong className="text-foreground">{selected.length}</strong> courses totalling{" "}
            <strong className="text-foreground">{totalMinutes}</strong> minutes. Open the builder to connect nodes
            visually.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" onClick={() => setSaved(false)}>
              Edit details
            </Button>
            {createdId && (
              <Button asChild>
                <Link href={`${backHref}/${createdId}`}>
                  Open path <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={backHref}>Back to paths</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Path details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || selected.length === 0) return;
              const fd = new FormData();
              fd.set("orgId", orgId);
              fd.set("name", name);
              fd.set("audience", audience);
              fd.set("required", "on");
              fd.set("credentialOnComplete", "on");
              startTransition(async () => {
                const res = await createPath(fd);
                if (res.ok) {
                  setCreatedId(res.id);
                  setSaved(true);
                  toast({
                    title: "Org path created",
                    description: `${selected.length} courses attached. Opening builder…`,
                    variant: "success",
                  });
                  router.refresh();
                }
              });
            }}
            className="space-y-3"
          >
            <div>
              <Label>Name</Label>
              <Input
                required
                placeholder="e.g. New-hire onboarding"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Audience</Label>
              <Input
                placeholder="e.g. All clinical employees"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Completion credential</Label>
              <Input
                placeholder="e.g. Clinical Foundations"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Compass className="h-4 w-4" /> {selected.length} courses selected
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Estimated learner time: {totalMinutes} minutes
              </div>
              {selectedCourses.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {selectedCourses.map((c, i) => (
                    <li key={c.id} className="flex items-center gap-2 text-xs">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] text-primary">
                        {i + 1}
                      </span>
                      <span className="truncate">{c.title}</span>
                      <button
                        type="button"
                        className="ml-auto text-muted-foreground transition hover:text-rose-500"
                        onClick={() => toggle(c.id)}
                        aria-label={`Remove ${c.title}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button className="w-full" type="submit" disabled={!name.trim() || selected.length === 0 || pending}>
              {pending ? "Creating…" : "Create and open builder"} <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shared catalog</CardTitle>
          <p className="text-sm text-muted-foreground">
            Courses with &ldquo;share to organization&rdquo; enabled. Tap to add to this path.
          </p>
        </CardHeader>
        <CardContent className="divide-y">
          {catalog.map((c) => {
            const isSelected = selected.includes(c.id);
            return (
              <div key={c.id} className="flex items-center gap-3 py-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-lg",
                    c.thumbnailColor
                  )}
                >
                  {c.thumbnailEmoji}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.sourceName} · {c.durationMinutes} min
                  </div>
                </div>
                <Badge variant="outline">{c.category}</Badge>
                <Button
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => toggle(c.id)}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Added
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" /> Add
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
