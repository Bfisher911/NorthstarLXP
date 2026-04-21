/**
 * Northstar LXP — core domain types.
 *
 * These types describe the full product model in the spec. The in-memory data
 * layer (lib/data.ts) implements a subset with rich seed data; the Postgres
 * schema in db/schema.sql mirrors these structures. Anything marked
 * `scaffolded` on the UI is typed here but not yet persisted end-to-end.
 */

export type Role =
  | "super_admin"
  | "org_admin"
  | "workspace_admin"
  | "workspace_author"
  | "workspace_viewer"
  | "manager"
  | "learner";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: "starter" | "growth" | "enterprise";
  industry: string;
  logoInitials: string;
  accent: string; // tailwind color token, e.g. "sky", "violet"
  seats: number;
  activeLearners: number;
  storageGb: number;
  storageQuotaGb: number;
  complianceHealth: number; // 0-1
  createdAt: string;
  headquarters: string;
  primaryDomain: string;
  flags: Array<"delinquent" | "at_risk" | "healthy">;
}

export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description: string;
  department: string;
  emoji: string;
  accent: string;
  courseCount: number;
  pathCount: number;
  activeAssignments: number;
  complianceHealth: number;
  lead: string; // user id
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  externalId: string;
  title: string;
  department: string;
  division?: string;
  location: string;
  campus?: string;
  hireDate: string;
  workerType: "full_time" | "part_time" | "contractor" | "intern";
  status: "active" | "on_leave" | "terminated";
  jobDuties?: string[];
}

export interface UserRecord {
  id: string;
  orgId: string;
  name: string;
  email: string;
  avatarSeed: string;
  roles: Array<{
    role: Role;
    scope: "platform" | "organization" | "workspace";
    workspaceId?: string;
  }>;
  managerId?: string;
  directReports?: string[];
  employee?: EmployeeProfile;
}

export type CourseType =
  | "authored"
  | "scorm"
  | "aicc"
  | "live_session"
  | "policy_attestation"
  | "evidence_task"
  | "survey";

export interface Course {
  id: string;
  orgId: string;
  workspaceId: string;
  title: string;
  summary: string;
  description: string;
  type: CourseType;
  category: string;
  tags: string[];
  durationMinutes: number;
  thumbnailColor: string;
  thumbnailEmoji: string;
  required: boolean;
  renewalMonths?: number;
  certificateEnabled: boolean;
  /**
   * How learners may re-engage with a completed course.
   *   - "review_only"  — they can read lessons and re-attempt quizzes at any
   *     time, but it never updates the compliance date / certificate.
   *   - "window_only"  — review is always available; a retake that DOES
   *     refresh the compliance date is only available once the learner is
   *     within `retakeWindowDays` of expiry (or already expired). This is
   *     the default for regulated-cycle content like HIPAA and BBP.
   *   - "anytime"      — learner can retake and refresh their compliance
   *     date whenever they want, without waiting for a window.
   */
  retakePolicy?: "review_only" | "window_only" | "anytime";
  /** Days before expiry the retake window opens, when policy is window_only. */
  retakeWindowDays?: number;
  aiContext?: string;
  regulatoryRefs?: string[];
  authors: string[]; // user ids
  published: boolean;
  updatedAt: string;
  /** Bullet-list learning objectives shown on the course landing. */
  learningObjectives?: string[];
  /** Short intro paragraph shown before the first module. */
  overview?: string;
  /** Credit / source list shown at the end of the course. */
  references?: string[];
  modules?: CourseModule[];
  scheduledSessions?: LiveSession[];
  policyFile?: { name: string; size: string };
  shareToOrg?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  type: "lesson" | "video" | "quiz" | "checkpoint" | "attestation" | "file";
  body?: string;
  durationMinutes?: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: "single" | "multi" | "true_false";
  options: { id: string; label: string; correct?: boolean }[];
  explanation?: string;
}

export interface LiveSession {
  id: string;
  courseId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  registered: number;
  location: string;
  instructor: string;
  virtual: boolean;
  registrationUrl?: string;
}

export interface LearningPath {
  id: string;
  orgId: string;
  workspaceId?: string; // undefined => org-wide
  name: string;
  summary: string;
  audience: string;
  coverAccent: string;
  certificateOnComplete: boolean;
  required: boolean;
  nodes: PathNode[];
  edges: PathEdge[];
  updatedAt: string;
  published: boolean;
  assignedCount: number;
  completionRate: number;
}

export type PathNodeKind =
  | "course"
  | "live"
  | "survey"
  | "policy"
  | "checkpoint"
  | "credential";

export interface PathNode {
  id: string;
  kind: PathNodeKind;
  title: string;
  subtitle?: string;
  courseId?: string;
  required: boolean;
  x: number; // 0-100
  y: number; // 0-100
  expiresMonths?: number;
  branchLabel?: string;
}

export interface PathEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  alternate?: boolean;
}

export interface Assignment {
  id: string;
  userId: string;
  courseId?: string;
  pathId?: string;
  dueAt?: string;
  status: "not_started" | "in_progress" | "completed" | "overdue" | "expired";
  progress: number; // 0-1
  assignedAt: string;
  method: AssignmentMethod;
  source?: string;
  score?: number;
  completedAt?: string;
  expiresAt?: string;
}

export type AssignmentMethod =
  | "manual"
  | "csv"
  | "group"
  | "smart_rule"
  | "survey"
  | "ai"
  | "self"
  | "org_path"
  | "path_node";

export interface SmartGroup {
  id: string;
  orgId: string;
  workspaceId?: string;
  name: string;
  description: string;
  conditions: SmartGroupCondition[];
  memberCount: number;
}

export interface SmartGroupCondition {
  field: string; // e.g. "title", "department"
  op: "equals" | "contains" | "in" | "starts_with" | "after" | "before";
  value: string | string[];
}

export interface Survey {
  id: string;
  orgId: string;
  workspaceId: string;
  title: string;
  description: string;
  schedule: "on_hire" | "annual" | "quarterly" | "manual";
  published: boolean;
  questions: SurveyQuestion[];
}

export interface SurveyQuestion {
  id: string;
  prompt: string;
  type: "single" | "multi" | "yes_no";
  options: { id: string; label: string; triggersCourseId?: string; triggersPathId?: string }[];
}

export interface Certificate {
  id: string;
  userId: string;
  courseId?: string;
  pathId?: string;
  issuedAt: string;
  expiresAt?: string;
  credentialCode: string;
  pdfTemplate: string;
  status: "active" | "expiring" | "expired";
}

export interface AiSuggestion {
  id: string;
  orgId: string;
  workspaceId: string;
  courseId?: string;
  pathId?: string;
  userId: string;
  reason: string;
  confidence: number; // 0-1
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  evidence: string[];
}

export interface AuditLogEntry {
  id: string;
  orgId: string;
  workspaceId?: string;
  actorId: string;
  action: string;
  target?: string;
  createdAt: string;
  meta?: Record<string, unknown>;
}

export interface NotificationTemplate {
  id: string;
  level: "platform" | "organization" | "workspace";
  orgId?: string;
  workspaceId?: string;
  event:
    | "assignment"
    | "due_soon"
    | "overdue"
    | "expiration"
    | "manager_digest"
    | "completion"
    | "path_completion"
    | "certificate_issued"
    | "live_session_reminder"
    | "evidence_review";
  subject: string;
  body: string;
  enabled: boolean;
}

export interface DashboardShare {
  id: string;
  orgId: string;
  workspaceId?: string;
  title: string;
  createdBy: string;
  createdAt: string;
  passwordProtected: boolean;
  url: string;
}

export interface ImpersonationSession {
  id: string;
  actorId: string;
  targetUserId: string;
  startedAt: string;
  endedAt?: string;
  reason: string;
}
