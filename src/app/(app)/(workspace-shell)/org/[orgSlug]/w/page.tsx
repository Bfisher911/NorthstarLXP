import { redirect } from "next/navigation";

/**
 * `/org/<slug>/w` has no index view — workspaces are listed at the org
 * level. When a breadcrumb click lands here, bounce over to the
 * workspaces directory instead of 404ing.
 */
export default async function WorkspaceIndexRedirect({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  redirect(`/org/${orgSlug}/workspaces`);
}
