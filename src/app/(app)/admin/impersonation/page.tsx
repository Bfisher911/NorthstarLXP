import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserById, impersonationSessions, users } from "@/lib/data";
import { formatDate, initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCog } from "lucide-react";
import { startImpersonation } from "@/app/actions/session";

export default function ImpersonationPage() {
  const impersonable = users.filter((u) => u.id !== "u_super");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><UserCog className="h-3 w-3" /> Impersonation</span>}
        title="Support impersonation"
        description="Every impersonation is logged in the audit trail. Use this for support only."
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent impersonation sessions</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {impersonationSessions.map((s) => {
            const actor = getUserById(s.actorId);
            const target = getUserById(s.targetUserId);
            return (
              <div key={s.id} className="flex items-center gap-3 py-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials(actor?.name ?? "?")}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-sm">
                  <span className="font-medium">{actor?.name}</span>{" "}
                  <span className="text-muted-foreground">impersonated</span>{" "}
                  <span className="font-medium">{target?.name}</span>
                  <div className="text-xs text-muted-foreground">
                    Started {formatDate(s.startedAt)} · "{s.reason}"
                  </div>
                </div>
                <Badge variant="outline">ended</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Impersonate a user</CardTitle>
          <p className="text-sm text-muted-foreground">Pick any tenant user. You'll return to your super-admin session when you exit.</p>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {impersonable.map((u) => (
            <form key={u.id} action={startImpersonation.bind(null, u.id)}>
              <Button type="submit" variant="outline" className="w-full justify-start">
                <Avatar className="mr-2 h-6 w-6">
                  <AvatarFallback className="text-[10px]">{initials(u.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-[10px] text-muted-foreground">{u.email}</div>
                </div>
              </Button>
            </form>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
