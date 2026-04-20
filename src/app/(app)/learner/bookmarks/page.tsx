import Link from "next/link";
import { ArrowRight, BookmarkPlus, Clock, Star } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCourseById } from "@/lib/data";

// Demo bookmarks for the learner persona. In production this is backed by a
// `bookmarks` table keyed by (user_id, course_id).
const bookmarkedIds = ["c_coaching", "c_back_safety", "c_phishing"];

export default function BookmarksPage() {
  const bookmarks = bookmarkedIds
    .map((id) => getCourseById(id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> Bookmarks</span>}
        title="Saved for later"
        description="Training you've starred. Pull any of it into your personal development path anytime."
        actions={
          <Button variant="outline" asChild>
            <Link href="/learner/development">Build my development path <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{bookmarks.length} saved</CardTitle>
          <Button variant="ghost" size="sm">
            <BookmarkPlus className="h-3.5 w-3.5" /> Browse catalog
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((c) => (
            <Link
              key={c.id}
              href={`/learner/course/${c.id}`}
              className="group relative block overflow-hidden rounded-xl border bg-card transition hover:shadow-md"
            >
              <div className={`relative h-24 bg-gradient-to-br ${c.thumbnailColor}`}>
                <div aria-hidden className="absolute inset-0 bg-star-field opacity-30" />
                <div className="absolute right-3 top-3 rounded-full bg-amber-400 p-1.5 text-white shadow">
                  <Star className="h-3 w-3 fill-white" />
                </div>
                <div className="absolute bottom-2 left-3 text-3xl">{c.thumbnailEmoji}</div>
              </div>
              <div className="p-4">
                <Badge variant="outline" className="mb-2 text-[10px]">{c.category}</Badge>
                <div className="line-clamp-2 text-sm font-semibold leading-snug">{c.title}</div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.summary}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {c.durationMinutes} min
                  </span>
                  <span className="text-primary opacity-0 transition group-hover:opacity-100">
                    Open →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
