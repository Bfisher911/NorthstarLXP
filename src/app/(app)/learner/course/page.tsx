import { redirect } from "next/navigation";

/**
 * `/learner/course` has no index view — individual course pages live at
 * `/learner/course/[courseId]`. If someone lands here (breadcrumb click,
 * manual URL), send them to the full training list instead of a 404.
 */
export default function LearnerCourseIndex() {
  redirect("/learner/training");
}
