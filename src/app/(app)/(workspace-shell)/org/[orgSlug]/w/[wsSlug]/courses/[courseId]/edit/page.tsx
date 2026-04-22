import { notFound } from "next/navigation";
import { CourseBuilder } from "@/components/course/course-builder";
import { getCourseById, getOrgBySlug, getWorkspaceBySlug } from "@/lib/data";

export default async function CourseBuilderPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string; courseId: string }>;
}) {
  const { orgSlug, wsSlug, courseId } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const course = getCourseById(courseId);
  if (!course) notFound();

  const backHref = `/org/${orgSlug}/w/${wsSlug}/courses/${course.id}`;
  const viewHref = `/org/${orgSlug}/w/${wsSlug}/courses/${course.id}`;

  return <CourseBuilder course={course} backHref={backHref} viewHref={viewHref} />;
}
