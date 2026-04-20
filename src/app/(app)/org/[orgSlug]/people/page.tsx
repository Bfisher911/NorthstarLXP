import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PeopleDirectory } from "@/components/people/people-directory";
import { getOrgBySlug, users } from "@/lib/data";

export default async function PeoplePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const orgPeople = users.filter((u) => u.orgId === org.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> People</span>}
        title="Directory"
        description="Everyone synced from your employee feed, with derived roles and memberships."
      />
      <PeopleDirectory users={orgPeople} />
    </div>
  );
}
