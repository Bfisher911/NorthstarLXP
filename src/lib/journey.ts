import type { Assignment, LearningPath, PathNode } from "./types";

export type NodeStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed"
  | "overdue"
  | "expiring";

/**
 * Derive the per-node status for a learner, given their assignments.
 * - "completed" takes precedence if the course assignment is completed and not expired.
 * - "overdue" if the course assignment is overdue.
 * - "expiring" if the certificate expires in <30 days.
 * - "in_progress" if started but not complete.
 * - "available" if all predecessors in the path are complete.
 * - "locked" otherwise.
 */
export function buildJourneyStatuses(
  path: LearningPath,
  assignments: Assignment[]
): Record<string, NodeStatus> {
  const statuses: Record<string, NodeStatus> = {};
  const byId = new Map<string, PathNode>();
  for (const n of path.nodes) byId.set(n.id, n);

  const incoming: Record<string, string[]> = {};
  for (const e of path.edges) {
    if (!incoming[e.to]) incoming[e.to] = [];
    incoming[e.to].push(e.from);
  }

  const assignmentByCourse = new Map<string, Assignment>();
  for (const a of assignments) {
    if (a.courseId) assignmentByCourse.set(a.courseId, a);
  }

  const now = Date.now();
  const thirtyDays = 30 * 24 * 3600 * 1000;

  function statusFor(node: PathNode): NodeStatus {
    if (!node.courseId) {
      // checkpoints / credentials — completed if all incoming done
      const preds = incoming[node.id] ?? [];
      if (preds.length === 0) return "completed";
      const allDone = preds.every((p) => statuses[p] === "completed");
      if (allDone) return "completed";
      return "locked";
    }
    const a = assignmentByCourse.get(node.courseId);
    if (!a) return preReqsMet(node) ? "available" : "locked";
    if (a.status === "completed") {
      if (a.expiresAt && new Date(a.expiresAt).getTime() - now < thirtyDays) {
        return "expiring";
      }
      return "completed";
    }
    if (a.status === "overdue") return "overdue";
    if (a.status === "in_progress") return "in_progress";
    return preReqsMet(node) ? "available" : "locked";
  }

  function preReqsMet(node: PathNode): boolean {
    const preds = incoming[node.id] ?? [];
    if (preds.length === 0) return true;
    // OR-semantics for alternate branches: any completed path in
    const anyDone = preds.some((p) => statuses[p] === "completed");
    return anyDone;
  }

  // Topological-ish pass: process nodes in order of dependency depth.
  const remaining = new Set(path.nodes.map((n) => n.id));
  let safety = 0;
  while (remaining.size > 0 && safety < 1000) {
    safety++;
    for (const id of Array.from(remaining)) {
      const node = byId.get(id)!;
      const preds = incoming[id] ?? [];
      if (preds.every((p) => !remaining.has(p))) {
        statuses[id] = statusFor(node);
        remaining.delete(id);
      }
    }
  }
  return statuses;
}
