import Link from "next/link";
import { ArrowRight, BookmarkPlus, Clock, Star } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/learner/bookmark-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getBookmarkedCourses } from "@/lib/data";
import { requireSession } from "@/lib/auth";

export default async function BookmarksPage() {
  const { user } = await requireSession();
  const bookmarked = getBookmarkedCourses(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> Bookmarks</span>}
        title="Saved for later"
        description="Training you've starred. Pull any of it into your personal development path anytime."
        actions={
          <Button variant="outline" asChild>
            <Link href="/learner/library">Browse library <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{bookmarked.length} saved</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/learner/library">
              <BookmarkPlus className="h-3.5 w-3.5" /> Browse library
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {bookmarked.length === 0 ? (
            <EmptyState
              icon={<Star className="h-5 w-5" />}
              title="Nothing saved yet"
              description="Tap the bookmark icon on any course card to save it here."
              action={
                <Button asChild>
                  <Link href="/learner/library">Browse the library</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {bookmarked.map((c) => (
                <div
                  key={c.id}
                  className="group relative overflow-hidden rounded-xl border bg-card transition hover:shadow-md"
                >
                  <Link href={`/learner/course/${c.id}`} className="block">
                    <div className={`relative h-24 bg-gradient-to-br ${c.thumbnailColor}`}>
                      <div aria-hidden className="absolute inset-0 bg-star-field opacity-30" />
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
                  <div className="absolute right-3 top-3">
                    <BookmarkButton
                      userId={user.id}
                      courseId={c.id}
                      courseTitle={c.title}
                      initialBookmarked={true}
                      variant="outline"
                      iconOnly
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
