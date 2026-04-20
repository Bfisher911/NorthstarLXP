"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { runGroomingJob } from "@/app/actions/mutations";

export function GroomingButton({ orgId, workspaceId }: { orgId: string; workspaceId: string }) {
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await runGroomingJob({ orgId, workspaceId });
          if (res.ok) {
            toast({
              title: "Grooming job complete",
              description:
                res.created === 0
                  ? "No new suggestions — every learner is already covered."
                  : `${res.created} new suggestion${res.created === 1 ? "" : "s"} added to the queue.`,
              variant: res.created > 0 ? "success" : "default",
            });
            router.refresh();
          }
        })
      }
    >
      <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />{" "}
      {pending ? "Running…" : "Run grooming job"}
    </Button>
  );
}
