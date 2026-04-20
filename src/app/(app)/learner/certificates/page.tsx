import { Award, Eye, Hourglass, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CertificatePreview } from "@/components/learner/certificate-preview";
import { requireSession } from "@/lib/auth";
import { getCertificatesForUser, getCourseById } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function CertificatesPage() {
  const { user } = await requireSession();
  const certs = getCertificatesForUser(user.id);
  const userName = user.name;
  const active = certs.filter((c) => c.status === "active");
  const expiring = certs.filter((c) => c.status === "expiring");
  const expired = certs.filter((c) => c.status === "expired");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Credentials"
        title="Your certificates"
        description="Each active credential is tied to a course or learning path. Renewals appear automatically when they're within 30 days."
      />

      <Section title="Active" icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />} count={active.length}>
        {active.map((c) => (
          <CertCard key={c.id} c={c} userName={userName} />
        ))}
      </Section>

      <Section title="Expiring soon" icon={<Hourglass className="h-4 w-4 text-amber-500" />} count={expiring.length}>
        {expiring.map((c) => (
          <CertCard key={c.id} c={c} userName={userName} />
        ))}
      </Section>

      <Section title="Expired" icon={<Award className="h-4 w-4 text-rose-500" />} count={expired.length}>
        {expired.map((c) => (
          <CertCard key={c.id} c={c} userName={userName} />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {title} <span className="ml-1 text-muted-foreground">({count})</span>
        </h2>
      </div>
      {count === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">None yet.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{children}</div>
      )}
    </div>
  );
}

function CertCard({ c, userName }: { c: ReturnType<typeof getCertificatesForUser>[number]; userName: string }) {
  const course = c.courseId ? getCourseById(c.courseId) : null;
  return (
    <Card className="relative overflow-hidden card-hover">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-constellation-gold via-amber-400 to-constellation-gold" />
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-constellation-gold/30 to-amber-500/30 text-amber-600">
            <Award className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{course?.title ?? "Credential"}</div>
            <div className="text-xs text-muted-foreground">Credential code: {c.credentialCode}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">Issued {formatDate(c.issuedAt)}</Badge>
              {c.expiresAt && (
                <Badge variant={c.status === "expired" ? "destructive" : c.status === "expiring" ? "warning" : "success"}>
                  {c.status === "expired" ? "Expired" : "Expires"} {formatDate(c.expiresAt)}
                </Badge>
              )}
            </div>
          </div>
          <CertificatePreview
            recipient={userName}
            courseTitle={course?.title ?? "Credential"}
            credentialCode={c.credentialCode}
            issuedAt={c.issuedAt}
            expiresAt={c.expiresAt}
            trigger={
              <Button variant="outline" size="sm">
                <Eye className="h-3.5 w-3.5" /> Preview
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
