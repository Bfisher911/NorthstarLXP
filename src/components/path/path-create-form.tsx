"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { createPath } from "@/app/actions/mutations";

export function PathCreateForm({
  backHref,
  orgId,
  workspaceId,
  defaultName = "",
  defaultAudience = "",
}: {
  backHref: string;
  orgId: string;
  workspaceId?: string;
  defaultName?: string;
  defaultAudience?: string;
}) {
  const [name, setName] = React.useState(defaultName);
  const [audience, setAudience] = React.useState(defaultAudience);
  const [required, setRequired] = React.useState(true);
  const [credential, setCredential] = React.useState(true);
  const [saved, setSaved] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [createdId, setCreatedId] = React.useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  if (saved) {
    return (
      <Card className="max-w-2xl border-emerald-500/40 bg-emerald-500/5">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Path created</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            <strong className="text-foreground">{name || "Untitled path"}</strong> is ready. Open the builder to lay
            out courses, surveys, live sessions, and checkpoints on the journey canvas.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" onClick={() => setSaved(false)}>
              Edit details
            </Button>
            {createdId && (
              <Button asChild>
                <Link href={`${backHref}/${createdId}/edit`}>
                  Open builder <ArrowRight className="h-4 w-4" />
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
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Path basics</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const fd = new FormData();
            fd.set("orgId", orgId);
            if (workspaceId) fd.set("workspaceId", workspaceId);
            fd.set("name", name);
            fd.set("audience", audience);
            if (required) fd.set("required", "on");
            if (credential) fd.set("credentialOnComplete", "on");
            startTransition(async () => {
              const res = await createPath(fd);
              if (res.ok) {
                setCreatedId(res.id);
                setSaved(true);
                toast({
                  title: "Path created",
                  description: `${name} — ready to lay out in the builder.`,
                  variant: "success",
                });
                router.refresh();
              }
            });
          }}
          className="space-y-4"
        >
          <div>
            <Label>Name</Label>
            <Input
              required
              placeholder="e.g. Annual Safety Recertification"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Audience</Label>
            <Input
              placeholder="Who should take this? e.g. All clinical staff, first 30 days."
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">Required</div>
              <div className="text-xs text-muted-foreground">Assignable via smart rules or org paths.</div>
            </div>
            <Switch checked={required} onCheckedChange={setRequired} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">Award credential on completion</div>
              <div className="text-xs text-muted-foreground">Creates a renewable credential for each learner.</div>
            </div>
            <Switch checked={credential} onCheckedChange={setCredential} />
          </div>
          <div className="flex items-center justify-between gap-2 pt-2">
            <Button type="button" variant="ghost" asChild>
              <Link href={backHref}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={!name.trim() || pending}>
              {pending ? "Creating…" : "Create and open builder"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
