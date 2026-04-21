import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  FileCheck2,
  Flag,
  MapPin,
  Save,
  ShieldCheck,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JourneyMap } from "@/components/path/journey-map";
import {
  getCourseById,
  getOrgBySlug,
  getPathById,
  getWorkspaceBySlug,
} from "@/lib/data";

const nodeTypes = [
  { id: "course", icon: BookOpen, label: "Course" },
  { id: "live", icon: Video, label: "Live session" },
  { id: "survey", icon: FileCheck2, label: "Survey" },
  { id: "policy", icon: ShieldCheck, label: "Policy" },
  { id: "checkpoint", icon: Flag, label: "Checkpoint" },
  { id: "credential", icon: MapPin, label: "Credential" },
];

export default async function PathBuilderPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string; pathId: string }>;
}) {
  const { orgSlug, wsSlug, pathId } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const path = getPathById(pathId);
  if (!path) notFound();

  const statuses: Record<string, "completed" | "available"> = {};
  path.nodes.forEach((n) => (statuses[n.id] = "available"));

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between gap-2 border-b bg-card/70 p-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/org/${orgSlug}/w/${wsSlug}/paths/${path.id}`}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
          </Button>
          <Input defaultValue={path.name} className="h-8 w-[340px] font-semibold" />
          <Badge variant={path.published ? "success" : "warning"}>
            {path.published ? "Published" : "Draft"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /> Preview as learner</Button>
          <Button variant="outline" size="sm"><Save className="h-3.5 w-3.5" /> Save</Button>
          <Button size="sm">Publish</Button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-[240px_1fr_320px]">
        <aside className="border-r bg-card/40 p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Drag to canvas
          </div>
          <div className="space-y-1.5">
            {nodeTypes.map((t) => (
              <button
                key={t.id}
                className="flex w-full items-center gap-2 rounded-md border bg-background p-2 text-left text-sm hover:border-primary/50"
              >
                <t.icon className="h-4 w-4 text-muted-foreground" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Nodes
          </div>
          <div className="space-y-1">
            {path.nodes.map((n) => (
              <div key={n.id} className="rounded-md border bg-background p-2 text-xs">
                <div className="font-medium">{n.title}</div>
                <div className="text-muted-foreground capitalize">{n.kind}{n.required ? " · required" : ""}</div>
              </div>
            ))}
          </div>
        </aside>

        <main className="bg-gradient-to-b from-background to-muted/20 p-6">
          <JourneyMap path={path} statuses={statuses} legend={false} height={520} />
          <p className="mt-3 text-xs text-muted-foreground">
            The learner view mirrors the map above. Drag nodes to reposition (scaffolded) and
            connect with edges to define prerequisites and alternates.
          </p>
        </main>

        <aside className="border-l bg-card/40 p-4 text-sm">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Path settings
          </div>
          <div className="mt-3 space-y-3">
            <Row label="Audience" value={path.audience} />
            <Row label="Workspace" value={ws.name} />
            <Row label="Certificate on complete" value={path.certificateOnComplete ? "Yes" : "No"} />
            <Row label="Required" value={path.required ? "Yes" : "Optional"} />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Course picker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {path.nodes.filter((n) => n.courseId).slice(0, 4).map((n) => {
                const c = getCourseById(n.courseId!)!;
                return (
                  <div key={n.id} className="flex items-center gap-2 rounded border p-2">
                    <span className="text-lg">{c.thumbnailEmoji}</span>
                    <span className="truncate font-medium">{c.title}</span>
                  </div>
                );
              })}
              <Button variant="outline" size="sm" className="w-full">Browse catalog</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] truncate text-right font-medium">{value}</span>
    </div>
  );
}
