import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { LibraryBrowser } from "@/components/learner/library-browser";
import { requireSession } from "@/lib/auth";
import { getAssignmentsForUser, getCoursesForOrg, isBookmarked } from "@/lib/data";

export default async function TrainingLibraryPage() {
  const { user } = await requireSession();

  // Every published course in the learner's org. The library is the
  // "discoverable catalog" — separate from /learner/training which only
  // shows what's been assigned or recommended.
  const catalog = getCoursesForOrg(user.orgId).filter((c) => c.published);
  const assignedCourseIds = new Set(
    getAssignmentsForUser(user.id)
      .map((a) => a.courseId)
      .filter((id): id is string => !!id)
  );

  const rows = catalog.map((c) => ({
    id: c.id,
    title: c.title,
    summary: c.summary,
    category: c.category,
    type: c.type,
    tags: c.tags,
    durationMinutes: c.durationMinutes,
    thumbnailColor: c.thumbnailColor,
    thumbnailEmoji: c.thumbnailEmoji,
    required: c.required,
    bookmarked: isBookmarked(user.id, c.id),
    assigned: assignedCourseIds.has(c.id),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3" /> Library</span>}
        title="Training library"
        description="Every course available to you across the organization. Not all of it is assigned — browse and bookmark anything that looks useful."
      />
      <LibraryBrowser userId={user.id} rows={rows} />
    </div>
  );
}
