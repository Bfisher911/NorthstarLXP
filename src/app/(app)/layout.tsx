import { redirect } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSession } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen">{children}</div>
    </TooltipProvider>
  );
}
