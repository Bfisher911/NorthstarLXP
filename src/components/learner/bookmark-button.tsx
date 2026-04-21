"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { toggleBookmark } from "@/app/actions/mutations";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  userId,
  courseId,
  courseTitle,
  initialBookmarked,
  variant = "outline",
  size = "sm",
  iconOnly,
}: {
  userId: string;
  courseId: string;
  courseTitle: string;
  initialBookmarked: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "icon";
  iconOnly?: boolean;
}) {
  const [bookmarked, setBookmarked] = React.useState(initialBookmarked);
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const click = () => {
    // Optimistic flip; server action is authoritative.
    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);
    startTransition(async () => {
      const res = await toggleBookmark({ userId, courseId });
      if (!res.ok) {
        setBookmarked(wasBookmarked);
        toast({ title: "Couldn't update bookmark", variant: "error" });
        return;
      }
      setBookmarked(res.bookmarked);
      toast({
        title: res.bookmarked ? "Bookmarked" : "Removed from bookmarks",
        description: res.bookmarked
          ? `${courseTitle} saved to your bookmarks.`
          : `${courseTitle} is no longer bookmarked.`,
        variant: "success",
        action: {
          label: "Undo",
          onClick: async () => {
            const undo = await toggleBookmark({ userId, courseId });
            if (undo.ok) setBookmarked(undo.bookmarked);
            router.refresh();
          },
        },
      });
      router.refresh();
    });
  };

  const Icon = bookmarked ? BookmarkCheck : Bookmark;
  return (
    <Button
      type="button"
      variant={variant}
      size={iconOnly ? "icon" : size}
      disabled={pending}
      onClick={click}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
      className={cn(
        "!text-foreground",
        bookmarked && "!text-amber-600 dark:!text-amber-400"
      )}
    >
      <Icon className={cn("h-4 w-4", bookmarked && "fill-amber-500")} />
      {!iconOnly && <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>}
    </Button>
  );
}
