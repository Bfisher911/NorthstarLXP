import { Star } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BookmarksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bookmarks"
        title="Saved training"
        description="Courses and live sessions you've saved for later."
      />
      <EmptyState
        icon={<Star className="h-5 w-5" />}
        title="Nothing saved yet"
        description="When you see a course that looks interesting, tap the bookmark icon — it'll show up here and be available to drop into your personal development path."
        action={
          <Button asChild>
            <Link href="/learner/development">Browse development</Link>
          </Button>
        }
      />
    </div>
  );
}
