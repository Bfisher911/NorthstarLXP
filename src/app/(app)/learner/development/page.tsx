import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/learner/bookmark-button";
import { requireSession } from "@/lib/auth";
import { getCoursesForOrg, isBookmarked } from "@/lib/data";

export default async function DevelopmentPage() {
  const { user } = await requireSession();
  const all = getCoursesForOrg(user.orgId);
  const optional = all.filter((c) => !c.required);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Optional development
          </span>
        }
        title="Grow at your own pace"
        description="Explore optional training that isn't required. Save courses to build a personal development path."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {optional.map((c) => (
          <Card key={c.id} className="group overflow-hidden">
            <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${c.thumbnailColor} text-5xl`}>
              {c.thumbnailEmoji}
              <div className="absolute right-3 top-3">
                <BookmarkButton
                  userId={user.id}
                  courseId={c.id}
                  courseTitle={c.title}
                  initialBookmarked={isBookmarked(user.id, c.id)}
                  variant="outline"
                  iconOnly
                />
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                <Badge variant="outline" className="text-[10px]">{c.durationMinutes} min</Badge>
              </div>
              <CardTitle className="mt-2 line-clamp-2 text-base">{c.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="line-clamp-2 text-xs text-muted-foreground">{c.summary}</p>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/learner/course/${c.id}`}>
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="flex items-center gap-3 p-5">
          <Sparkles className="h-5 w-5 text-primary" />
          <div className="text-sm">
            <span className="font-semibold">Coming soon:</span>{" "}
            <span className="text-muted-foreground">
              Northstar will auto-arrange your bookmarked courses into a personal journey map.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
