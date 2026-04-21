import type {
  AiSuggestion,
  Assignment,
  AuditLogEntry,
  Certificate,
  Course,
  DashboardShare,
  ImpersonationSession,
  LearningPath,
  NotificationTemplate,
  Organization,
  Role,
  SmartGroup,
  Survey,
  UserRecord,
  Workspace,
} from "./types";

/**
 * In-memory data layer. All demo data lives here. The Postgres schema in
 * `db/schema.sql` mirrors this shape. Swap these exports for a Supabase
 * client when moving to a database.
 */

const today = new Date("2026-04-18");

function addDays(days: number) {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function addMonths(months: number) {
  const d = new Date(today);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

export const organizations: Organization[] = [
  {
    id: "org_meridian",
    name: "Meridian Health System",
    slug: "meridian",
    plan: "enterprise",
    industry: "Healthcare",
    logoInitials: "MH",
    accent: "emerald",
    seats: 14000,
    activeLearners: 12483,
    storageGb: 182,
    storageQuotaGb: 500,
    complianceHealth: 0.91,
    createdAt: "2022-03-14",
    headquarters: "Portland, OR",
    primaryDomain: "meridianhealth.org",
    flags: ["healthy"],
  },
  {
    id: "org_atlas",
    name: "Atlas University",
    slug: "atlas",
    plan: "growth",
    industry: "Higher Education",
    logoInitials: "AU",
    accent: "violet",
    seats: 6500,
    activeLearners: 5721,
    storageGb: 74,
    storageQuotaGb: 250,
    complianceHealth: 0.78,
    createdAt: "2023-08-21",
    headquarters: "Boulder, CO",
    primaryDomain: "atlas.edu",
    flags: ["at_risk"],
  },
  {
    id: "org_northwind",
    name: "Northwind Logistics",
    slug: "northwind",
    plan: "starter",
    industry: "Logistics & Safety",
    logoInitials: "NW",
    accent: "amber",
    seats: 1800,
    activeLearners: 1602,
    storageGb: 22,
    storageQuotaGb: 100,
    complianceHealth: 0.83,
    createdAt: "2025-02-02",
    headquarters: "Tacoma, WA",
    primaryDomain: "northwindlog.com",
    flags: ["healthy"],
  },
];

export const workspaces: Workspace[] = [
  {
    id: "ws_hipaa",
    orgId: "org_meridian",
    name: "HIPAA Training Office",
    slug: "hipaa",
    description:
      "Federal privacy and security compliance training for all clinical and operational staff.",
    department: "Compliance",
    emoji: "🛡️",
    accent: "emerald",
    courseCount: 24,
    pathCount: 6,
    activeAssignments: 8420,
    complianceHealth: 0.94,
    lead: "u_org_admin_meridian",
  },
  {
    id: "ws_ehs",
    orgId: "org_meridian",
    name: "Environmental Health & Safety",
    slug: "ehs",
    description:
      "OSHA, bloodborne pathogens, back safety, chemical handling, and incident response.",
    department: "Safety",
    emoji: "🧪",
    accent: "amber",
    courseCount: 31,
    pathCount: 9,
    activeAssignments: 6210,
    complianceHealth: 0.86,
    lead: "u_ws_admin_ehs",
  },
  {
    id: "ws_leadership_meridian",
    orgId: "org_meridian",
    name: "Leadership Development",
    slug: "leadership",
    description:
      "Clinical and operational leadership programs, mentorship, and career pathways.",
    department: "People Ops",
    emoji: "🧭",
    accent: "sky",
    courseCount: 18,
    pathCount: 4,
    activeAssignments: 1140,
    complianceHealth: 0.97,
    lead: "u_ws_admin_lead",
  },
  {
    id: "ws_clinical_onboarding",
    orgId: "org_meridian",
    name: "Clinical Onboarding",
    slug: "onboarding",
    description:
      "Required first-30-days training for new hires across all clinical roles.",
    department: "Nursing Admin",
    emoji: "🩺",
    accent: "rose",
    courseCount: 42,
    pathCount: 11,
    activeAssignments: 912,
    complianceHealth: 0.89,
    lead: "u_ws_admin_onboarding",
  },
  {
    id: "ws_atlas_faculty",
    orgId: "org_atlas",
    name: "Faculty Development",
    slug: "faculty",
    description:
      "Teaching excellence, academic integrity, Title IX, and continuing education.",
    department: "Academic Affairs",
    emoji: "🎓",
    accent: "violet",
    courseCount: 20,
    pathCount: 5,
    activeAssignments: 1832,
    complianceHealth: 0.72,
    lead: "u_org_admin_atlas",
  },
  {
    id: "ws_atlas_research",
    orgId: "org_atlas",
    name: "Research Integrity",
    slug: "research",
    description:
      "IRB training, responsible conduct of research, and grant management compliance.",
    department: "Office of Research",
    emoji: "🔬",
    accent: "indigo",
    courseCount: 14,
    pathCount: 3,
    activeAssignments: 804,
    complianceHealth: 0.81,
    lead: "u_ws_admin_research",
  },
  {
    id: "ws_atlas_it",
    orgId: "org_atlas",
    name: "IT & Security Training",
    slug: "it-security",
    description:
      "Phishing, credential hygiene, data classification, and device compliance.",
    department: "Information Security",
    emoji: "🔐",
    accent: "cyan",
    courseCount: 12,
    pathCount: 2,
    activeAssignments: 5510,
    complianceHealth: 0.69,
    lead: "u_ws_admin_itsec",
  },
  {
    id: "ws_northwind_fleet",
    orgId: "org_northwind",
    name: "Fleet Safety",
    slug: "fleet",
    description:
      "DOT compliance, vehicle inspections, defensive driving, and hours-of-service.",
    department: "Operations",
    emoji: "🚚",
    accent: "amber",
    courseCount: 16,
    pathCount: 4,
    activeAssignments: 1423,
    complianceHealth: 0.88,
    lead: "u_org_admin_northwind",
  },
  {
    id: "ws_northwind_warehouse",
    orgId: "org_northwind",
    name: "Warehouse Operations",
    slug: "warehouse",
    description:
      "Forklift certification, ergonomics, hazardous materials, and incident response.",
    department: "Warehouse",
    emoji: "📦",
    accent: "emerald",
    courseCount: 21,
    pathCount: 5,
    activeAssignments: 980,
    complianceHealth: 0.8,
    lead: "u_ws_admin_warehouse",
  },
];

// ---------- Users ----------
const avatar = (seed: string) => seed;

export const users: UserRecord[] = [
  // Platform super admin
  {
    id: "u_super",
    orgId: "__platform__",
    name: "Ivy Chen",
    email: "ivy.chen@northstarlxp.com",
    avatarSeed: avatar("ivy-chen"),
    roles: [{ role: "super_admin", scope: "platform" }],
  },
  // Meridian org
  {
    id: "u_org_admin_meridian",
    orgId: "org_meridian",
    name: "Jordan Alvarez",
    email: "jordan.alvarez@meridianhealth.org",
    avatarSeed: avatar("jordan-alvarez"),
    roles: [{ role: "org_admin", scope: "organization" }],
    employee: {
      id: "e_jordan",
      userId: "u_org_admin_meridian",
      externalId: "MH-0001",
      title: "VP, Learning & Development",
      department: "People Operations",
      location: "Portland, OR",
      hireDate: "2019-02-01",
      workerType: "full_time",
      status: "active",
    },
  },
  {
    id: "u_ws_admin_ehs",
    orgId: "org_meridian",
    name: "Priya Nair",
    email: "priya.nair@meridianhealth.org",
    avatarSeed: avatar("priya-nair"),
    roles: [
      { role: "workspace_admin", scope: "workspace", workspaceId: "ws_ehs" },
      { role: "workspace_author", scope: "workspace", workspaceId: "ws_hipaa" },
    ],
  },
  {
    id: "u_ws_admin_lead",
    orgId: "org_meridian",
    name: "Marcus Bell",
    email: "marcus.bell@meridianhealth.org",
    avatarSeed: avatar("marcus-bell"),
    roles: [
      { role: "workspace_admin", scope: "workspace", workspaceId: "ws_leadership_meridian" },
    ],
  },
  {
    id: "u_ws_admin_onboarding",
    orgId: "org_meridian",
    name: "Dana Whitefeather",
    email: "dana.whitefeather@meridianhealth.org",
    avatarSeed: avatar("dana-w"),
    roles: [
      { role: "workspace_admin", scope: "workspace", workspaceId: "ws_clinical_onboarding" },
    ],
  },
  {
    id: "u_manager_meridian_icu",
    orgId: "org_meridian",
    name: "Elena Ruiz",
    email: "elena.ruiz@meridianhealth.org",
    avatarSeed: avatar("elena-ruiz"),
    roles: [{ role: "manager", scope: "organization" }],
    directReports: ["u_learner_1", "u_learner_2", "u_learner_3", "u_learner_4", "u_learner_5"],
    employee: {
      id: "e_elena",
      userId: "u_manager_meridian_icu",
      externalId: "MH-2481",
      title: "Nurse Manager, ICU",
      department: "Critical Care",
      division: "Acute Services",
      location: "Portland, OR",
      campus: "Riverside Campus",
      hireDate: "2018-08-12",
      workerType: "full_time",
      status: "active",
    },
  },
  // Learners
  {
    id: "u_learner_1",
    orgId: "org_meridian",
    name: "Sam Okafor",
    email: "sam.okafor@meridianhealth.org",
    avatarSeed: avatar("sam-okafor"),
    roles: [{ role: "learner", scope: "organization" }],
    managerId: "u_manager_meridian_icu",
    employee: {
      id: "e_sam",
      userId: "u_learner_1",
      externalId: "MH-4120",
      title: "Registered Nurse, ICU",
      department: "Critical Care",
      division: "Acute Services",
      location: "Portland, OR",
      campus: "Riverside Campus",
      hireDate: "2024-07-08",
      workerType: "full_time",
      status: "active",
      jobDuties: [
        "Administer medications",
        "Handle blood products",
        "Lifts over 50 lbs",
        "Patient records access",
      ],
    },
  },
  {
    id: "u_learner_2",
    orgId: "org_meridian",
    name: "Aisha Patel",
    email: "aisha.patel@meridianhealth.org",
    avatarSeed: avatar("aisha-patel"),
    roles: [{ role: "learner", scope: "organization" }],
    managerId: "u_manager_meridian_icu",
    employee: {
      id: "e_aisha",
      userId: "u_learner_2",
      externalId: "MH-4121",
      title: "Charge Nurse, ICU",
      department: "Critical Care",
      division: "Acute Services",
      location: "Portland, OR",
      campus: "Riverside Campus",
      hireDate: "2021-11-02",
      workerType: "full_time",
      status: "active",
    },
  },
  {
    id: "u_learner_3",
    orgId: "org_meridian",
    name: "Diego Fernandez",
    email: "diego.fernandez@meridianhealth.org",
    avatarSeed: avatar("diego-fernandez"),
    roles: [{ role: "learner", scope: "organization" }],
    managerId: "u_manager_meridian_icu",
    employee: {
      id: "e_diego",
      userId: "u_learner_3",
      externalId: "MH-4122",
      title: "Respiratory Therapist",
      department: "Respiratory Care",
      location: "Portland, OR",
      campus: "Riverside Campus",
      hireDate: "2023-03-15",
      workerType: "full_time",
      status: "active",
    },
  },
  {
    id: "u_learner_4",
    orgId: "org_meridian",
    name: "Harper Lee",
    email: "harper.lee@meridianhealth.org",
    avatarSeed: avatar("harper-lee"),
    roles: [{ role: "learner", scope: "organization" }],
    managerId: "u_manager_meridian_icu",
    employee: {
      id: "e_harper",
      userId: "u_learner_4",
      externalId: "MH-4123",
      title: "Clinical Assistant",
      department: "Critical Care",
      location: "Portland, OR",
      campus: "Riverside Campus",
      hireDate: "2025-01-06",
      workerType: "part_time",
      status: "active",
    },
  },
  {
    id: "u_learner_5",
    orgId: "org_meridian",
    name: "Nadia Brooks",
    email: "nadia.brooks@meridianhealth.org",
    avatarSeed: avatar("nadia-brooks"),
    roles: [{ role: "learner", scope: "organization" }],
    managerId: "u_manager_meridian_icu",
    employee: {
      id: "e_nadia",
      userId: "u_learner_5",
      externalId: "MH-4124",
      title: "Registered Nurse, ICU",
      department: "Critical Care",
      location: "Portland, OR",
      campus: "Westbank Campus",
      hireDate: "2022-05-19",
      workerType: "full_time",
      status: "active",
    },
  },
  // Atlas
  {
    id: "u_org_admin_atlas",
    orgId: "org_atlas",
    name: "Reena Mehta",
    email: "reena.mehta@atlas.edu",
    avatarSeed: avatar("reena-mehta"),
    roles: [{ role: "org_admin", scope: "organization" }],
  },
  {
    id: "u_ws_admin_research",
    orgId: "org_atlas",
    name: "Tomás Barros",
    email: "tomas.barros@atlas.edu",
    avatarSeed: avatar("tomas-barros"),
    roles: [{ role: "workspace_admin", scope: "workspace", workspaceId: "ws_atlas_research" }],
  },
  {
    id: "u_ws_admin_itsec",
    orgId: "org_atlas",
    name: "Kyra Novak",
    email: "kyra.novak@atlas.edu",
    avatarSeed: avatar("kyra-novak"),
    roles: [{ role: "workspace_admin", scope: "workspace", workspaceId: "ws_atlas_it" }],
  },
  // Northwind
  {
    id: "u_org_admin_northwind",
    orgId: "org_northwind",
    name: "Quinn Hollister",
    email: "quinn.hollister@northwindlog.com",
    avatarSeed: avatar("quinn-hollister"),
    roles: [{ role: "org_admin", scope: "organization" }],
  },
  {
    id: "u_ws_admin_warehouse",
    orgId: "org_northwind",
    name: "Rafael Souza",
    email: "rafael.souza@northwindlog.com",
    avatarSeed: avatar("rafael-souza"),
    roles: [
      { role: "workspace_admin", scope: "workspace", workspaceId: "ws_northwind_warehouse" },
    ],
  },
];

// ---------- Courses ----------
export const courses: Course[] = [
  {
    id: "c_hipaa_core",
    orgId: "org_meridian",
    workspaceId: "ws_hipaa",
    title: "HIPAA Privacy & Security Core",
    summary: "Foundational HIPAA training required for all workforce members.",
    description:
      "Covers protected health information (PHI), minimum necessary standard, the Privacy Rule, Security Rule safeguards, breach notification requirements, and sanctions.",
    type: "authored",
    category: "Compliance",
    tags: ["HIPAA", "Privacy", "PHI", "Required"],
    durationMinutes: 35,
    thumbnailColor: "from-emerald-500/90 to-sky-600/90",
    thumbnailEmoji: "🛡️",
    required: true,
    renewalMonths: 12,
    certificateEnabled: true,
    aiContext:
      "All workforce members with access to PHI. Pay attention to roles with EHR access, billing, IT, and clinical support.",
    regulatoryRefs: ["45 CFR §§160, 164", "HITECH Act"],
    authors: ["u_ws_admin_ehs"],
    published: true,
    updatedAt: addDays(-21),
    shareToOrg: true,
    modules: [
      { id: "m1", title: "What is PHI?", type: "lesson", body: "PHI definitions & examples.", durationMinutes: 6 },
      { id: "m2", title: "Minimum Necessary Standard", type: "lesson", durationMinutes: 5 },
      { id: "m3", title: "Security Rule Safeguards", type: "video", durationMinutes: 9 },
      { id: "m4", title: "Breach Notification", type: "lesson", durationMinutes: 6 },
      {
        id: "m5",
        title: "Knowledge Check",
        type: "quiz",
        durationMinutes: 8,
        questions: [
          {
            id: "q1",
            prompt: "Which of the following is considered PHI?",
            type: "single",
            options: [
              { id: "a", label: "A patient's de-identified aggregate data" },
              { id: "b", label: "A patient chart with medical record number", correct: true },
              { id: "c", label: "An internal training policy" },
              { id: "d", label: "A vendor product brochure" },
            ],
            explanation: "Any individually identifiable health information used or disclosed by a covered entity.",
          },
          {
            id: "q2",
            prompt: "The Minimum Necessary Standard applies to treatment disclosures.",
            type: "true_false",
            options: [
              { id: "a", label: "True" },
              { id: "b", label: "False", correct: true },
            ],
            explanation: "Treatment disclosures are exempt from minimum necessary.",
          },
        ],
      },
    ],
  },
  {
    id: "c_bbp",
    orgId: "org_meridian",
    workspaceId: "ws_ehs",
    title: "Bloodborne Pathogens",
    summary: "OSHA 1910.1030 training for staff with occupational exposure.",
    description: "Modes of transmission, exposure control plan, PPE, post-exposure procedures.",
    type: "authored",
    category: "Safety",
    tags: ["OSHA", "BBP", "PPE"],
    durationMinutes: 25,
    thumbnailColor: "from-rose-500/90 to-orange-500/90",
    thumbnailEmoji: "🩸",
    required: true,
    renewalMonths: 12,
    certificateEnabled: true,
    aiContext:
      "Assign to roles handling blood products, sharps, or potentially infectious materials — nursing, phlebotomy, EVS, lab.",
    regulatoryRefs: ["29 CFR 1910.1030"],
    authors: ["u_ws_admin_ehs"],
    published: true,
    updatedAt: addDays(-8),
    shareToOrg: true,
  },
  {
    id: "c_back_safety",
    orgId: "org_meridian",
    workspaceId: "ws_ehs",
    title: "Back Safety & Safe Lifting",
    summary: "Proper body mechanics, lifting technique, and injury prevention.",
    description: "For roles involving lifting, patient handling, or repetitive motion.",
    type: "authored",
    category: "Safety",
    tags: ["Ergonomics", "Lifting", "Injury Prevention"],
    durationMinutes: 18,
    thumbnailColor: "from-amber-500/90 to-orange-600/90",
    thumbnailEmoji: "🏋️",
    required: false,
    renewalMonths: 24,
    certificateEnabled: true,
    aiContext: "Assign to staff lifting >50 lbs, patient handling, warehouse roles.",
    authors: ["u_ws_admin_ehs"],
    published: true,
    updatedAt: addDays(-40),
  },
  {
    id: "c_fire_safety",
    orgId: "org_meridian",
    workspaceId: "ws_ehs",
    title: "Fire Safety & Evacuation",
    summary: "RACE, PASS, fire extinguisher use, and evacuation routes.",
    description: "Annual fire safety training for all on-site staff.",
    type: "scorm",
    category: "Safety",
    tags: ["Fire", "Evacuation", "SCORM"],
    durationMinutes: 22,
    thumbnailColor: "from-red-500/90 to-amber-500/90",
    thumbnailEmoji: "🚨",
    required: true,
    renewalMonths: 12,
    certificateEnabled: true,
    authors: ["u_ws_admin_ehs"],
    published: true,
    updatedAt: addDays(-120),
  },
  {
    id: "c_infection_control",
    orgId: "org_meridian",
    workspaceId: "ws_clinical_onboarding",
    title: "Infection Prevention & Control",
    summary: "Hand hygiene, PPE, isolation precautions, and outbreak response.",
    description: "Required for clinical staff within 30 days of hire.",
    type: "authored",
    category: "Clinical",
    tags: ["IPC", "Hand Hygiene", "PPE"],
    durationMinutes: 30,
    thumbnailColor: "from-cyan-500/90 to-blue-600/90",
    thumbnailEmoji: "🧼",
    required: true,
    renewalMonths: 12,
    certificateEnabled: true,
    authors: ["u_ws_admin_onboarding"],
    published: true,
    updatedAt: addDays(-60),
    shareToOrg: true,
  },
  {
    id: "c_code_of_conduct",
    orgId: "org_meridian",
    workspaceId: "ws_hipaa",
    title: "Code of Conduct Attestation",
    summary: "Read the policy and attest to the Code of Conduct.",
    description:
      "Annual attestation that you have read and understand the Meridian Code of Conduct.",
    type: "policy_attestation",
    category: "Compliance",
    tags: ["Attestation", "Policy", "Annual"],
    durationMinutes: 10,
    thumbnailColor: "from-indigo-500/90 to-violet-600/90",
    thumbnailEmoji: "📜",
    required: true,
    renewalMonths: 12,
    certificateEnabled: false,
    authors: ["u_org_admin_meridian"],
    published: true,
    updatedAt: addDays(-7),
    policyFile: { name: "Meridian-Code-of-Conduct-2026.pdf", size: "1.8 MB" },
    shareToOrg: true,
  },
  {
    id: "c_coaching",
    orgId: "org_meridian",
    workspaceId: "ws_leadership_meridian",
    title: "Coaching & Feedback for First-Time Managers",
    summary: "A live cohort-based program for new people managers.",
    description:
      "Four live sessions plus practice assignments. Focused on feedback, one-on-ones, and delegation.",
    type: "live_session",
    category: "Leadership",
    tags: ["Leadership", "Live", "Cohort"],
    durationMinutes: 240,
    thumbnailColor: "from-sky-500/90 to-indigo-600/90",
    thumbnailEmoji: "🧭",
    required: false,
    certificateEnabled: true,
    authors: ["u_ws_admin_lead"],
    published: true,
    updatedAt: addDays(-18),
    scheduledSessions: [
      {
        id: "s1",
        courseId: "c_coaching",
        title: "Session 1: Foundations of Coaching",
        startsAt: addDays(6),
        endsAt: addDays(6),
        capacity: 30,
        registered: 24,
        location: "Virtual — Zoom",
        instructor: "Marcus Bell",
        virtual: true,
      },
      {
        id: "s2",
        courseId: "c_coaching",
        title: "Session 2: Giving Feedback",
        startsAt: addDays(13),
        endsAt: addDays(13),
        capacity: 30,
        registered: 24,
        location: "Virtual — Zoom",
        instructor: "Marcus Bell",
        virtual: true,
      },
    ],
  },
  {
    id: "c_needs_assessment",
    orgId: "org_meridian",
    workspaceId: "ws_ehs",
    title: "Annual Safety Needs Assessment",
    summary: "Identify the safety training each employee needs.",
    description:
      "Responses drive assignment of Bloodborne Pathogens, Back Safety, Respiratory Fit, and other safety courses.",
    type: "survey",
    category: "Assessment",
    tags: ["Survey", "Annual", "Triggers"],
    durationMinutes: 8,
    thumbnailColor: "from-teal-500/90 to-cyan-600/90",
    thumbnailEmoji: "📋",
    required: true,
    renewalMonths: 12,
    certificateEnabled: false,
    authors: ["u_ws_admin_ehs"],
    published: true,
    updatedAt: addDays(-4),
  },
  {
    id: "c_phishing",
    orgId: "org_atlas",
    workspaceId: "ws_atlas_it",
    title: "Phishing & Credential Hygiene",
    summary: "Recognize phishing attempts and protect credentials.",
    description: "Simulated phishing, MFA, password managers, and incident reporting.",
    type: "authored",
    category: "Security",
    tags: ["Phishing", "Security", "MFA"],
    durationMinutes: 20,
    thumbnailColor: "from-cyan-500/90 to-blue-700/90",
    thumbnailEmoji: "🔐",
    required: true,
    renewalMonths: 12,
    certificateEnabled: true,
    authors: ["u_ws_admin_itsec"],
    published: true,
    updatedAt: addDays(-30),
  },
  {
    id: "c_irb",
    orgId: "org_atlas",
    workspaceId: "ws_atlas_research",
    title: "IRB & Human Subjects Research",
    summary: "Protections for human research participants.",
    description: "Belmont Report, informed consent, vulnerable populations.",
    type: "authored",
    category: "Research",
    tags: ["IRB", "Ethics"],
    durationMinutes: 55,
    thumbnailColor: "from-violet-500/90 to-indigo-700/90",
    thumbnailEmoji: "🔬",
    required: true,
    renewalMonths: 36,
    certificateEnabled: true,
    authors: ["u_ws_admin_research"],
    published: true,
    updatedAt: addDays(-45),
  },
  {
    id: "c_title_ix",
    orgId: "org_atlas",
    workspaceId: "ws_atlas_faculty",
    title: "Title IX for Responsible Employees",
    summary: "Reporting obligations and supportive measures.",
    description: "Federal Title IX compliance for faculty and staff.",
    type: "authored",
    category: "Compliance",
    tags: ["Title IX", "Reporting"],
    durationMinutes: 45,
    thumbnailColor: "from-violet-500/90 to-fuchsia-600/90",
    thumbnailEmoji: "⚖️",
    required: true,
    renewalMonths: 12,
    certificateEnabled: true,
    authors: ["u_org_admin_atlas"],
    published: true,
    updatedAt: addDays(-14),
  },
  {
    id: "c_forklift",
    orgId: "org_northwind",
    workspaceId: "ws_northwind_warehouse",
    title: "Forklift Operator Certification",
    summary: "OSHA 1910.178 powered industrial trucks training.",
    description: "Classroom + practical evaluation. Includes in-person evidence task.",
    type: "evidence_task",
    category: "Safety",
    tags: ["Forklift", "OSHA", "Certification"],
    durationMinutes: 120,
    thumbnailColor: "from-amber-500/90 to-red-600/90",
    thumbnailEmoji: "🏗️",
    required: true,
    renewalMonths: 36,
    certificateEnabled: true,
    authors: ["u_ws_admin_warehouse"],
    published: true,
    updatedAt: addDays(-90),
  },
  {
    id: "c_defensive_driving",
    orgId: "org_northwind",
    workspaceId: "ws_northwind_fleet",
    title: "Defensive Driving for CDL Drivers",
    summary: "Hazard recognition and crash avoidance for commercial drivers.",
    description: "Annual defensive driving recertification.",
    type: "authored",
    category: "Safety",
    tags: ["Driving", "CDL", "DOT"],
    durationMinutes: 45,
    thumbnailColor: "from-emerald-500/90 to-lime-600/90",
    thumbnailEmoji: "🚚",
    required: true,
    renewalMonths: 12,
    certificateEnabled: true,
    authors: ["u_org_admin_northwind"],
    published: true,
    updatedAt: addDays(-11),
  },
];

// ---------- Learning Paths ----------
export const learningPaths: LearningPath[] = [
  {
    id: "lp_new_hire_clinical",
    orgId: "org_meridian",
    workspaceId: undefined, // org-wide
    name: "Clinical New Hire Journey",
    summary:
      "The first 30 days for every clinical hire — compliance, safety, and culture woven into one journey map.",
    audience: "All clinical roles in the first 30 days of employment.",
    coverAccent: "emerald",
    certificateOnComplete: true,
    required: true,
    published: true,
    updatedAt: addDays(-12),
    assignedCount: 312,
    completionRate: 0.68,
    nodes: [
      { id: "n1", kind: "checkpoint", title: "Welcome to Meridian", x: 8, y: 50, required: true },
      {
        id: "n2",
        kind: "course",
        title: "HIPAA Privacy & Security Core",
        subtitle: "35 min · Compliance",
        courseId: "c_hipaa_core",
        x: 24,
        y: 30,
        required: true,
        expiresMonths: 12,
      },
      {
        id: "n3",
        kind: "survey",
        title: "Safety Needs Assessment",
        subtitle: "Drives downstream safety training",
        courseId: "c_needs_assessment",
        x: 24,
        y: 70,
        required: true,
      },
      {
        id: "n4",
        kind: "course",
        title: "Infection Prevention & Control",
        subtitle: "30 min · Clinical",
        courseId: "c_infection_control",
        x: 44,
        y: 30,
        required: true,
        expiresMonths: 12,
      },
      {
        id: "n5",
        kind: "course",
        title: "Bloodborne Pathogens",
        subtitle: "25 min · Safety",
        courseId: "c_bbp",
        x: 44,
        y: 58,
        required: true,
        branchLabel: "If exposure risk",
        expiresMonths: 12,
      },
      {
        id: "n6",
        kind: "course",
        title: "Back Safety & Safe Lifting",
        subtitle: "18 min · Safety",
        courseId: "c_back_safety",
        x: 44,
        y: 82,
        required: false,
        branchLabel: "If lifts >50 lbs",
      },
      {
        id: "n7",
        kind: "policy",
        title: "Code of Conduct Attestation",
        subtitle: "Annual attestation",
        courseId: "c_code_of_conduct",
        x: 64,
        y: 48,
        required: true,
        expiresMonths: 12,
      },
      {
        id: "n8",
        kind: "course",
        title: "Fire Safety & Evacuation",
        subtitle: "22 min · Safety",
        courseId: "c_fire_safety",
        x: 64,
        y: 76,
        required: true,
        expiresMonths: 12,
      },
      {
        id: "n9",
        kind: "credential",
        title: "Clinical Foundations Credential",
        subtitle: "Awarded on completion",
        x: 86,
        y: 50,
        required: true,
      },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n1", to: "n3" },
      { id: "e3", from: "n2", to: "n4" },
      { id: "e4", from: "n3", to: "n5", label: "Yes — blood products" },
      { id: "e5", from: "n3", to: "n6", label: "Yes — lifts >50 lbs", alternate: true },
      { id: "e6", from: "n4", to: "n7" },
      { id: "e7", from: "n5", to: "n7" },
      { id: "e8", from: "n6", to: "n8", alternate: true },
      { id: "e9", from: "n7", to: "n9" },
      { id: "e10", from: "n8", to: "n9" },
    ],
  },
  {
    id: "lp_leader_track",
    orgId: "org_meridian",
    workspaceId: "ws_leadership_meridian",
    name: "First-Time Manager Track",
    summary:
      "A cohort-based journey for new people managers: coaching, feedback, and operational excellence.",
    audience: "Newly promoted or hired people managers.",
    coverAccent: "sky",
    certificateOnComplete: true,
    required: false,
    published: true,
    updatedAt: addDays(-5),
    assignedCount: 58,
    completionRate: 0.42,
    nodes: [
      { id: "ln1", kind: "checkpoint", title: "Kickoff", x: 8, y: 50, required: true },
      {
        id: "ln2",
        kind: "live",
        title: "Coaching Cohort — Live Sessions",
        subtitle: "4 virtual sessions",
        courseId: "c_coaching",
        x: 32,
        y: 50,
        required: true,
      },
      {
        id: "ln3",
        kind: "course",
        title: "HIPAA Privacy & Security Core",
        subtitle: "Required for managers with PHI access",
        courseId: "c_hipaa_core",
        x: 56,
        y: 30,
        required: true,
      },
      {
        id: "ln4",
        kind: "checkpoint",
        title: "Practice: Deliver 3 Feedback Conversations",
        x: 56,
        y: 70,
        required: true,
      },
      {
        id: "ln5",
        kind: "credential",
        title: "Manager Foundations Credential",
        x: 82,
        y: 50,
        required: true,
      },
    ],
    edges: [
      { id: "le1", from: "ln1", to: "ln2" },
      { id: "le2", from: "ln2", to: "ln3" },
      { id: "le3", from: "ln2", to: "ln4" },
      { id: "le4", from: "ln3", to: "ln5" },
      { id: "le5", from: "ln4", to: "ln5" },
    ],
  },
  {
    id: "lp_research_integrity",
    orgId: "org_atlas",
    workspaceId: "ws_atlas_research",
    name: "Research Integrity Credential",
    summary: "Required program for anyone conducting sponsored research.",
    audience: "Principal investigators, co-investigators, research assistants.",
    coverAccent: "violet",
    certificateOnComplete: true,
    required: true,
    published: true,
    updatedAt: addDays(-22),
    assignedCount: 412,
    completionRate: 0.56,
    nodes: [
      { id: "rn1", kind: "checkpoint", title: "Program Overview", x: 8, y: 50, required: true },
      {
        id: "rn2",
        kind: "course",
        title: "IRB & Human Subjects Research",
        courseId: "c_irb",
        x: 30,
        y: 40,
        required: true,
      },
      {
        id: "rn3",
        kind: "course",
        title: "Title IX for Responsible Employees",
        courseId: "c_title_ix",
        x: 30,
        y: 75,
        required: false,
      },
      { id: "rn4", kind: "policy", title: "Data Handling Attestation", x: 58, y: 50, required: true },
      { id: "rn5", kind: "credential", title: "Research Integrity Credential", x: 84, y: 50, required: true },
    ],
    edges: [
      { id: "re1", from: "rn1", to: "rn2" },
      { id: "re2", from: "rn1", to: "rn3" },
      { id: "re3", from: "rn2", to: "rn4" },
      { id: "re4", from: "rn3", to: "rn4", alternate: true },
      { id: "re5", from: "rn4", to: "rn5" },
    ],
  },
];

// ---------- Assignments (Sam Okafor focus) ----------
export const assignments: Assignment[] = [
  {
    id: "a_sam_hipaa",
    userId: "u_learner_1",
    courseId: "c_hipaa_core",
    pathId: "lp_new_hire_clinical",
    dueAt: addDays(5),
    status: "in_progress",
    progress: 0.55,
    assignedAt: addDays(-18),
    method: "org_path",
    source: "Clinical New Hire Journey",
  },
  {
    id: "a_sam_bbp",
    userId: "u_learner_1",
    courseId: "c_bbp",
    pathId: "lp_new_hire_clinical",
    dueAt: addDays(-3),
    status: "overdue",
    progress: 0.3,
    assignedAt: addDays(-22),
    method: "survey",
    source: "Safety Needs Assessment → Yes (blood products)",
  },
  {
    id: "a_sam_back",
    userId: "u_learner_1",
    courseId: "c_back_safety",
    pathId: "lp_new_hire_clinical",
    dueAt: addDays(10),
    status: "not_started",
    progress: 0,
    assignedAt: addDays(-18),
    method: "survey",
    source: "Safety Needs Assessment → Yes (lifts >50 lbs)",
  },
  {
    id: "a_sam_ipc",
    userId: "u_learner_1",
    courseId: "c_infection_control",
    pathId: "lp_new_hire_clinical",
    status: "completed",
    progress: 1,
    assignedAt: addDays(-25),
    completedAt: addDays(-10),
    expiresAt: addMonths(12),
    method: "org_path",
    score: 0.94,
  },
  {
    id: "a_sam_coc",
    userId: "u_learner_1",
    courseId: "c_code_of_conduct",
    pathId: "lp_new_hire_clinical",
    dueAt: addDays(14),
    status: "not_started",
    progress: 0,
    assignedAt: addDays(-18),
    method: "org_path",
  },
  {
    id: "a_sam_fire",
    userId: "u_learner_1",
    courseId: "c_fire_safety",
    pathId: "lp_new_hire_clinical",
    dueAt: addDays(20),
    status: "not_started",
    progress: 0,
    assignedAt: addDays(-18),
    method: "org_path",
  },
  {
    id: "a_sam_coaching",
    userId: "u_learner_1",
    courseId: "c_coaching",
    status: "not_started",
    progress: 0,
    assignedAt: addDays(-3),
    method: "self",
  },
  // Other learners
  {
    id: "a_aisha_hipaa",
    userId: "u_learner_2",
    courseId: "c_hipaa_core",
    pathId: "lp_new_hire_clinical",
    status: "completed",
    progress: 1,
    assignedAt: addDays(-200),
    completedAt: addDays(-190),
    expiresAt: addDays(175),
    method: "org_path",
    score: 0.96,
  },
  {
    id: "a_aisha_bbp",
    userId: "u_learner_2",
    courseId: "c_bbp",
    status: "completed",
    progress: 1,
    assignedAt: addDays(-400),
    completedAt: addDays(-380),
    expiresAt: addDays(-15), // expired
    method: "smart_rule",
  },
  {
    id: "a_aisha_coc",
    userId: "u_learner_2",
    courseId: "c_code_of_conduct",
    dueAt: addDays(21),
    status: "not_started",
    progress: 0,
    assignedAt: addDays(-2),
    method: "smart_rule",
  },
  {
    id: "a_diego_hipaa",
    userId: "u_learner_3",
    courseId: "c_hipaa_core",
    status: "completed",
    progress: 1,
    assignedAt: addDays(-300),
    completedAt: addDays(-290),
    expiresAt: addDays(75),
    method: "smart_rule",
  },
  {
    id: "a_diego_bbp",
    userId: "u_learner_3",
    courseId: "c_bbp",
    dueAt: addDays(8),
    status: "in_progress",
    progress: 0.4,
    assignedAt: addDays(-15),
    method: "ai",
    source: "AI: handles respiratory specimens",
  },
  {
    id: "a_harper_hipaa",
    userId: "u_learner_4",
    courseId: "c_hipaa_core",
    pathId: "lp_new_hire_clinical",
    dueAt: addDays(2),
    status: "in_progress",
    progress: 0.85,
    assignedAt: addDays(-14),
    method: "org_path",
  },
  {
    id: "a_harper_ipc",
    userId: "u_learner_4",
    courseId: "c_infection_control",
    pathId: "lp_new_hire_clinical",
    dueAt: addDays(-1),
    status: "overdue",
    progress: 0.2,
    assignedAt: addDays(-14),
    method: "org_path",
  },
  {
    id: "a_nadia_hipaa",
    userId: "u_learner_5",
    courseId: "c_hipaa_core",
    status: "completed",
    progress: 1,
    assignedAt: addDays(-200),
    completedAt: addDays(-185),
    expiresAt: addDays(180),
    method: "smart_rule",
  },
  {
    id: "a_nadia_fire",
    userId: "u_learner_5",
    courseId: "c_fire_safety",
    status: "completed",
    progress: 1,
    assignedAt: addDays(-380),
    completedAt: addDays(-360),
    expiresAt: addDays(5), // expiring soon
    method: "smart_rule",
  },
];

// ---------- Certificates ----------
export const certificates: Certificate[] = [
  {
    id: "cert_sam_ipc",
    userId: "u_learner_1",
    courseId: "c_infection_control",
    issuedAt: addDays(-10),
    expiresAt: addMonths(12),
    credentialCode: "IPC-MH-00482",
    pdfTemplate: "default",
    status: "active",
  },
  {
    id: "cert_aisha_hipaa",
    userId: "u_learner_2",
    courseId: "c_hipaa_core",
    issuedAt: addDays(-190),
    expiresAt: addDays(175),
    credentialCode: "HIPAA-MH-00298",
    pdfTemplate: "default",
    status: "active",
  },
  {
    id: "cert_nadia_fire",
    userId: "u_learner_5",
    courseId: "c_fire_safety",
    issuedAt: addDays(-360),
    expiresAt: addDays(5),
    credentialCode: "FIRE-MH-00721",
    pdfTemplate: "default",
    status: "expiring",
  },
  {
    id: "cert_aisha_bbp",
    userId: "u_learner_2",
    courseId: "c_bbp",
    issuedAt: addDays(-380),
    expiresAt: addDays(-15),
    credentialCode: "BBP-MH-00155",
    pdfTemplate: "default",
    status: "expired",
  },
];

// ---------- Smart groups ----------
export const smartGroups: SmartGroup[] = [
  {
    id: "sg_clinical_icu",
    orgId: "org_meridian",
    workspaceId: "ws_ehs",
    name: "ICU Clinical Staff",
    description: "All active clinical staff in Critical Care",
    memberCount: 184,
    conditions: [
      { field: "department", op: "equals", value: "Critical Care" },
      { field: "status", op: "equals", value: "active" },
    ],
  },
  {
    id: "sg_new_hires_30",
    orgId: "org_meridian",
    name: "New Hires (past 30 days)",
    description: "Anyone with a hire date in the last 30 days",
    memberCount: 67,
    conditions: [{ field: "hire_date", op: "after", value: "2026-03-19" }],
  },
  {
    id: "sg_warehouse_forklift",
    orgId: "org_northwind",
    workspaceId: "ws_northwind_warehouse",
    name: "Warehouse Forklift Operators",
    description: "Warehouse staff with forklift operation in job duties",
    memberCount: 58,
    conditions: [
      { field: "department", op: "equals", value: "Warehouse" },
      { field: "job_duties", op: "contains", value: "forklift" },
    ],
  },
];

// ---------- Surveys ----------
export const surveys: Survey[] = [
  {
    id: "srv_safety_needs",
    orgId: "org_meridian",
    workspaceId: "ws_ehs",
    title: "Annual Safety Needs Assessment",
    description:
      "Drives automatic assignment of downstream safety training based on answers.",
    schedule: "annual",
    published: true,
    questions: [
      {
        id: "sq1",
        prompt: "Do you handle blood or blood products as part of your work?",
        type: "yes_no",
        options: [
          { id: "y", label: "Yes", triggersCourseId: "c_bbp" },
          { id: "n", label: "No" },
        ],
      },
      {
        id: "sq2",
        prompt: "Do you routinely lift more than 50 pounds?",
        type: "yes_no",
        options: [
          { id: "y", label: "Yes", triggersCourseId: "c_back_safety" },
          { id: "n", label: "No" },
        ],
      },
      {
        id: "sq3",
        prompt: "Do you work with hazardous chemicals?",
        type: "yes_no",
        options: [
          { id: "y", label: "Yes" },
          { id: "n", label: "No" },
        ],
      },
    ],
  },
];

// ---------- AI Suggestions ----------
export const aiSuggestions: AiSuggestion[] = [
  {
    id: "ai_1",
    orgId: "org_meridian",
    workspaceId: "ws_ehs",
    courseId: "c_bbp",
    userId: "u_learner_3",
    reason:
      "Job title 'Respiratory Therapist' and job duty 'handles respiratory specimens' match Bloodborne Pathogens assignment criteria.",
    confidence: 0.92,
    createdAt: addDays(-2),
    status: "pending",
    evidence: [
      "Title: Respiratory Therapist",
      "Duty: Specimen handling",
      "Department: Respiratory Care",
    ],
  },
  {
    id: "ai_2",
    orgId: "org_meridian",
    workspaceId: "ws_ehs",
    courseId: "c_back_safety",
    userId: "u_learner_4",
    reason:
      "Clinical Assistant title typically involves patient repositioning and lifting. No existing Back Safety completion found.",
    confidence: 0.81,
    createdAt: addDays(-2),
    status: "pending",
    evidence: [
      "Title: Clinical Assistant",
      "Typical duties include patient transfers",
      "No prior Back Safety completion",
    ],
  },
  {
    id: "ai_3",
    orgId: "org_meridian",
    workspaceId: "ws_hipaa",
    courseId: "c_hipaa_core",
    userId: "u_learner_3",
    reason:
      "PHI access expected for Respiratory Care roles. Certificate will expire in 75 days — recommend renewal assignment now.",
    confidence: 0.88,
    createdAt: addDays(-1),
    status: "pending",
    evidence: [
      "Department: Respiratory Care",
      "Certificate expires in 75 days",
      "Renewal window open",
    ],
  },
];

// ---------- Notifications ----------
export const notificationTemplates: NotificationTemplate[] = [
  {
    id: "nt_plat_due",
    level: "platform",
    event: "due_soon",
    subject: "Upcoming training: {{course_title}} is due {{due_date}}",
    body: "Hi {{first_name}},\n\nA quick reminder that **{{course_title}}** is due on **{{due_date}}**. You can start any time:\n{{launch_link}}",
    enabled: true,
  },
  {
    id: "nt_org_welcome",
    level: "organization",
    orgId: "org_meridian",
    event: "assignment",
    subject: "Welcome to Meridian — your first learning journey is ready",
    body: "Welcome aboard. Your Clinical New Hire Journey is waiting. It should take about 2 hours total, broken across several short modules.",
    enabled: true,
  },
  {
    id: "nt_ws_bbp",
    level: "workspace",
    orgId: "org_meridian",
    workspaceId: "ws_ehs",
    event: "overdue",
    subject: "Action required: Bloodborne Pathogens is overdue",
    body: "This is a safety requirement. Please complete within 48 hours.",
    enabled: true,
  },
];

export const dashboardShares: DashboardShare[] = [
  {
    id: "share_exec_compliance",
    orgId: "org_meridian",
    title: "Executive Compliance Snapshot (Monthly)",
    createdBy: "u_org_admin_meridian",
    createdAt: addDays(-12),
    passwordProtected: true,
    url: "https://northstar.app/share/m-exec-ab392f",
  },
];

export const auditLog: AuditLogEntry[] = [
  {
    id: "al_1",
    orgId: "org_meridian",
    actorId: "u_super",
    action: "impersonation.started",
    target: "u_org_admin_meridian",
    createdAt: addDays(-1),
    meta: { reason: "Support — missing workspace visibility" },
  },
  {
    id: "al_2",
    orgId: "org_meridian",
    workspaceId: "ws_ehs",
    actorId: "u_ws_admin_ehs",
    action: "course.published",
    target: "c_bbp",
    createdAt: addDays(-8),
  },
  {
    id: "al_3",
    orgId: "org_meridian",
    actorId: "u_org_admin_meridian",
    action: "learning_path.published",
    target: "lp_new_hire_clinical",
    createdAt: addDays(-12),
  },
];

export const bookmarks: Array<{ userId: string; courseId: string; createdAt: string }> = [
  { userId: "u_learner_1", courseId: "c_coaching", createdAt: new Date().toISOString() },
  { userId: "u_learner_1", courseId: "c_back_safety", createdAt: new Date().toISOString() },
  { userId: "u_learner_1", courseId: "c_phishing", createdAt: new Date().toISOString() },
];

export function isBookmarked(userId: string, courseId: string): boolean {
  return bookmarks.some((b) => b.userId === userId && b.courseId === courseId);
}

export function getBookmarkedCourses(userId: string) {
  return bookmarks
    .filter((b) => b.userId === userId)
    .map((b) => getCourseById(b.courseId))
    .filter((c): c is NonNullable<typeof c> => !!c);
}

export const impersonationSessions: ImpersonationSession[] = [
  {
    id: "is_1",
    actorId: "u_super",
    targetUserId: "u_org_admin_meridian",
    startedAt: addDays(-1),
    endedAt: addDays(-1),
    reason: "Support — missing workspace visibility",
  },
];

// ---------- Accessor helpers ----------
export function getUserById(id: string) {
  return users.find((u) => u.id === id);
}
export function getOrgById(id: string) {
  return organizations.find((o) => o.id === id);
}
export function getOrgBySlug(slug: string) {
  return organizations.find((o) => o.slug === slug);
}
export function getWorkspaceById(id: string) {
  return workspaces.find((w) => w.id === id);
}
export function getWorkspaceBySlug(orgId: string, slug: string) {
  return workspaces.find((w) => w.orgId === orgId && w.slug === slug);
}
export function getWorkspacesForOrg(orgId: string) {
  return workspaces.filter((w) => w.orgId === orgId);
}
export function getCourseById(id: string) {
  return courses.find((c) => c.id === id);
}
export function getCoursesForWorkspace(workspaceId: string) {
  return courses.filter((c) => c.workspaceId === workspaceId);
}
export function getCoursesForOrg(orgId: string) {
  return courses.filter((c) => c.orgId === orgId);
}
export function getPathById(id: string) {
  return learningPaths.find((p) => p.id === id);
}
export function getPathsForWorkspace(workspaceId: string) {
  return learningPaths.filter((p) => p.workspaceId === workspaceId);
}
export function getPathsForOrg(orgId: string) {
  return learningPaths.filter((p) => p.orgId === orgId);
}
export function getAssignmentsForUser(userId: string) {
  return assignments.filter((a) => a.userId === userId);
}
export function getDirectReports(userId: string) {
  const mgr = getUserById(userId);
  return (mgr?.directReports ?? []).map((id) => getUserById(id)).filter(Boolean) as UserRecord[];
}
export function getCertificatesForUser(userId: string) {
  return certificates.filter((c) => c.userId === userId);
}
export function getAiSuggestionsForWorkspace(workspaceId: string) {
  return aiSuggestions.filter((s) => s.workspaceId === workspaceId);
}
export function hasRole(user: UserRecord | undefined, role: Role, scope?: { workspaceId?: string; orgId?: string }) {
  if (!user) return false;
  return user.roles.some((r) => {
    if (r.role !== role) return false;
    if (scope?.workspaceId && r.workspaceId !== scope.workspaceId) return false;
    return true;
  });
}

// ---------- Personas for quick sign-in ----------
export const personas: Array<{
  userId: string;
  title: string;
  role: Role;
  homePath: string;
  blurb: string;
}> = [
  {
    userId: "u_super",
    title: "Ivy Chen · Platform Super Admin",
    role: "super_admin",
    homePath: "/admin",
    blurb: "Vendor-level view across all tenants, health, and billing.",
  },
  {
    userId: "u_org_admin_meridian",
    title: "Jordan Alvarez · Organization Admin (Meridian Health)",
    role: "org_admin",
    homePath: "/org/meridian",
    blurb: "Leads L&D across every workspace in Meridian Health System.",
  },
  {
    userId: "u_ws_admin_ehs",
    title: "Priya Nair · Workspace Admin (EH&S)",
    role: "workspace_admin",
    homePath: "/org/meridian/w/ehs",
    blurb: "Owns safety compliance training for the Meridian EH&S workspace.",
  },
  {
    userId: "u_manager_meridian_icu",
    title: "Elena Ruiz · People Manager (ICU)",
    role: "manager",
    homePath: "/learner",
    blurb: "Oversees training compliance for 5 direct reports in the ICU — signs in as a learner first.",
  },
  {
    userId: "u_learner_1",
    title: "Sam Okafor · Learner (New Hire RN)",
    role: "learner",
    homePath: "/learner",
    blurb: "A new hire nurse partway through the Clinical New Hire Journey.",
  },
];
