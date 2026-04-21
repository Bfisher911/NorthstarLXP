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
    overview:
      "HIPAA — the Health Insurance Portability and Accountability Act — protects the privacy and security of patient health information. This course is required every 12 months for everyone who may see, hear, type, transport, or dispose of patient information at Meridian, regardless of role.",
    learningObjectives: [
      "Identify what is and isn't Protected Health Information (PHI)",
      "Apply the Minimum Necessary Standard to everyday situations",
      "Recognize the three types of Security Rule safeguards",
      "Know when and how to report a suspected breach within 24 hours",
      "Describe sanctions for willful or repeated violations",
    ],
    references: [
      "45 CFR §§ 160, 162, 164 — HHS HIPAA Administrative Simplification",
      "HITECH Act (Public Law 111-5, Title XIII)",
      "HHS Office for Civil Rights — Breach Notification Rule",
    ],
    modules: [
      {
        id: "m1",
        title: "What is PHI?",
        type: "lesson",
        durationMinutes: 6,
        body: `**Protected Health Information (PHI)** is any individually identifiable health information — held or transmitted by a covered entity or its business associate — in any form (electronic, paper, spoken).

To count as PHI, information must meet two tests:
- It relates to a person's past, present, or future **health, care, or payment**
- It contains at least one of the **18 identifiers** defined by HIPAA

### The 18 HIPAA identifiers
- Name
- Geographic subdivisions smaller than state (street, city, ZIP except first 3 digits in most cases)
- Dates directly related to the individual (birth, admission, discharge, death) — except year alone for ages ≤ 89
- Phone, fax, email
- Social Security number
- Medical record number
- Health plan / account / certificate numbers
- Vehicle VIN, license plate
- Device identifiers and serial numbers
- URLs, IP addresses
- Biometric identifiers (fingerprint, voice)
- Full-face photos and comparable images
- Any other unique identifying number, characteristic, or code

### Is this PHI?
- ✅ *"John Smith was admitted on 3/14 with pneumonia."*
- ✅ *An X-ray labeled with an MRN.*
- ❌ *De-identified aggregate counts ("23 patients admitted last week").*
- ❌ *An internal training policy about PHI handling.*

> **Remember:** PHI follows the information, not the document. A Post-it on your desk with a patient's name and diagnosis is PHI even if it never enters the EHR.`,
      },
      {
        id: "m2",
        title: "The Minimum Necessary Standard",
        type: "lesson",
        durationMinutes: 5,
        body: `When using or disclosing PHI for anything other than direct **treatment**, HIPAA requires you to limit the disclosure to the **minimum necessary** to accomplish the task.

### When it applies
- Disclosures to business associates (billing, IT vendors, analytics)
- Internal access for payment and operations
- Marketing, fundraising, research (with additional rules)

### When it does NOT apply
- **Treatment** — clinicians always get what they need
- **Disclosures to the patient**
- **Disclosures required by law** (subpoenas, mandated reporting)
- **Authorized disclosures** where the patient has signed a valid release

### Practical examples
- A scheduling clerk should only see appointment times and phone numbers — not lab results.
- When replying to a billing inquiry, include the account number in question, not the entire chart.
- If a coworker is hospitalized, do not open their chart out of curiosity. That's a violation even if you're a clinician.

Role-based access controls in the EHR exist to enforce this. If you can see information you don't need to do your job, report it to Compliance — it's a configuration bug, not a convenience.`,
      },
      {
        id: "m3",
        title: "Security Rule Safeguards",
        type: "video",
        durationMinutes: 9,
        body: `The **Security Rule** applies specifically to electronic PHI (ePHI) and requires three categories of safeguards.

### Administrative safeguards
- Designated Security Officer
- Workforce training and sanctions
- Access management (who gets which credentials)
- Contingency plan (disaster recovery, data backup, emergency operations)

### Physical safeguards
- Facility access controls (badges, locked server rooms)
- Workstation security (auto-lock, positioning screens away from public view)
- Device and media controls (encrypted drives, disposal procedures)

### Technical safeguards
- **Access control** — unique user IDs, automatic logoff, emergency access
- **Audit controls** — logging who accessed what
- **Integrity** — mechanisms to confirm ePHI hasn't been altered or destroyed
- **Transmission security** — encryption for ePHI in motion (TLS, VPN)

### What this means for you
- Never share your credentials — every EHR action is logged against your ID.
- Lock your workstation every time you walk away (Win+L / Ctrl+Cmd+Q).
- Only transmit PHI through approved, encrypted channels. Personal email, consumer Dropbox, and personal USB drives are all prohibited.
- Report lost or stolen devices (laptops, phones, badges) to IT Security immediately.`,
      },
      {
        id: "m4",
        title: "Breach notification",
        type: "lesson",
        durationMinutes: 6,
        body: `A **breach** is any acquisition, access, use, or disclosure of PHI in a manner not permitted by the Privacy Rule that compromises its security or privacy.

### The 24-hour rule at Meridian
Meridian's internal policy requires **reporting to the Compliance line within 24 hours** of discovery — even if you're unsure whether it's a reportable breach. Compliance performs the formal risk assessment.

### Examples that MUST be reported
- PHI emailed to the wrong recipient
- Paper charts, labels, or wristbands left in a public area
- A workforce member accessing a record without a legitimate business reason
- Lost or stolen unencrypted laptop, phone, or USB drive
- Ransomware, malware, or suspicious login on a workstation

### What happens next
1. **Risk assessment** — probability the PHI was compromised (nature/extent, who received it, whether it was actually viewed, mitigation)
2. **Notification clock** — covered entities have **60 days** to notify affected individuals; large breaches (≥ 500 people) trigger immediate HHS and media notifications
3. **Business associate breaches** — the BA must notify Meridian within a defined period (typically 60 days), and Meridian notifies individuals

### Retaliation is prohibited
You may not be retaliated against for reporting in good faith. Hide-the-breach behavior is itself a sanctionable offense under Meridian's Code of Conduct.`,
      },
      {
        id: "m5",
        title: "Knowledge check",
        type: "quiz",
        durationMinutes: 9,
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
            explanation:
              "Information that can be linked back to an individual (here via MRN) and relates to their care is PHI. De-identified data and internal policies are not.",
          },
          {
            id: "q2",
            prompt: "The Minimum Necessary Standard applies to treatment disclosures.",
            type: "true_false",
            options: [
              { id: "a", label: "True" },
              { id: "b", label: "False", correct: true },
            ],
            explanation:
              "Treatment disclosures are exempt — clinicians need full information to care safely for the patient.",
          },
          {
            id: "q3",
            prompt: "You find a printed lab report on a break-room table with a patient's name on it. What should you do?",
            type: "single",
            options: [
              { id: "a", label: "Throw it in the recycle bin" },
              { id: "b", label: "Post on Slack asking whose it is" },
              { id: "c", label: "Place it in a secure shred bin and report the incident to Compliance", correct: true },
              { id: "d", label: "Return it to the chart room without telling anyone" },
            ],
            explanation:
              "Paper PHI must be destroyed in a secure shred bin. Because it was left in a public space, this also triggers a breach report — Compliance assesses risk.",
          },
          {
            id: "q4",
            prompt: "Which is NOT required by the HIPAA Security Rule?",
            type: "single",
            options: [
              { id: "a", label: "Unique user IDs for every workforce member" },
              { id: "b", label: "Encryption of ePHI in transit" },
              { id: "c", label: "A workforce-wide ban on personal phones in the building", correct: true },
              { id: "d", label: "Audit controls that log access to ePHI" },
            ],
            explanation:
              "The Security Rule requires unique IDs, transmission security, and audit controls. It does not mandate a building-wide phone ban — that's a workplace policy choice.",
          },
          {
            id: "q5",
            prompt: "Within how many hours of discovering a suspected breach should you contact Meridian Compliance?",
            type: "single",
            options: [
              { id: "a", label: "8 hours" },
              { id: "b", label: "24 hours", correct: true },
              { id: "c", label: "60 days" },
              { id: "d", label: "Only if you're sure it's a reportable breach" },
            ],
            explanation:
              "Meridian policy requires reporting within 24 hours of discovery. Compliance — not you — makes the formal risk determination.",
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
    overview:
      "OSHA's Bloodborne Pathogens Standard (29 CFR 1910.1030) applies to every employee with reasonably anticipated occupational exposure to blood or other potentially infectious materials (OPIM). This refresher walks through the four pathogens that matter most at Meridian, the safeguards in our Exposure Control Plan, and exactly what to do in the first 15 minutes after a needlestick.",
    learningObjectives: [
      "Identify bloodborne pathogens of primary concern (HIV, HBV, HCV)",
      "Distinguish blood vs. OPIM and when Universal Precautions apply",
      "Select appropriate PPE for the task at hand",
      "Execute the correct post-exposure protocol, including reporting within 1 hour",
      "Describe the hepatitis B vaccination offer and declination process",
    ],
    references: [
      "29 CFR 1910.1030 — Bloodborne Pathogens",
      "CDC: Updated U.S. Public Health Service Guidelines for Management of Occupational Exposures",
      "Meridian Exposure Control Plan (2026 revision)",
    ],
    modules: [
      {
        id: "bbp1",
        title: "The four pathogens that matter most",
        type: "lesson",
        durationMinutes: 4,
        body: `A **bloodborne pathogen** is a microorganism present in human blood or OPIM that can cause disease when it enters the body.

### Primary concerns
- **Hepatitis B virus (HBV)** — extremely hardy, can survive on surfaces ≥ 7 days. Vaccine is safe and >95% effective after a 3-dose series. Meridian offers it at no cost to every at-risk employee.
- **Hepatitis C virus (HCV)** — no vaccine. Average risk per needlestick ≈ 1.8%. Modern direct-acting antivirals cure most cases.
- **Human immunodeficiency virus (HIV)** — risk per needlestick ≈ 0.3%. Post-exposure prophylaxis (PEP) must begin within hours to be effective.
- **Other** — Zika, West Nile, syphilis, Ebola in outbreak settings. Follow Standard Precautions for all patients.

### What counts as OPIM?
- Semen, vaginal secretions
- CSF, synovial, pleural, pericardial, peritoneal, amniotic fluid
- Any body fluid visibly contaminated with blood
- Unfixed human tissue, organ culture, HIV/HBV-containing cultures

Saliva, tears, urine, feces, sweat are NOT OPIM unless visibly bloody. Still, **Universal Precautions** mean you treat every patient's body fluids as potentially infectious.`,
      },
      {
        id: "bbp2",
        title: "The exposure control plan",
        type: "lesson",
        durationMinutes: 5,
        body: `Meridian's **Exposure Control Plan (ECP)** lives on the Safety intranet page. It's updated at least annually and includes:

1. **Exposure determination** — a list of job classifications with exposure, including nursing, phlebotomy, EVS, central sterile, surgical services, autopsy, lab, and first responders.
2. **Schedule and methods of compliance** with:
   - **Universal / Standard Precautions** — treat all blood and OPIM as infectious
   - **Engineering controls** — sharps containers, safety-engineered needles, biohazard bags
   - **Work practice controls** — no recapping needles, no eating in patient-care areas, handwashing
   - **PPE** — gloves, gowns, goggles, face shields, surgical/N95 masks
3. **Hepatitis B vaccination** — offered within 10 working days of hire, at no cost. Declination must be signed but can be reversed any time.
4. **Post-exposure evaluation and follow-up** — see the next module.
5. **Annual training and recordkeeping**.

> **Key rule:** If you ever have to recap a needle (rare, e.g. for an arterial blood gas sample), use a **one-handed scoop technique** — never use both hands.`,
      },
      {
        id: "bbp3",
        title: "Selecting the right PPE",
        type: "lesson",
        durationMinutes: 4,
        body: `PPE is selected based on **anticipated exposure**, not diagnosis. You should never need to know a patient's infection status to pick appropriate PPE.

### Gloves
- Any contact with blood, OPIM, mucous membranes, non-intact skin, or contaminated surfaces.
- Change gloves between tasks on the same patient (e.g. wound care → chart work).
- **Double-glove for surgery, and any high-risk procedure.**

### Gown
- When splashes or significant soiling is anticipated.
- Fluid-resistant for routine care; fluid-impervious for heavy exposure (GI bleed, L&D, irrigation).

### Eye and face protection
- Goggles or face shield whenever splashes are possible (suctioning, irrigation, bronchoscopy).
- A regular surgical mask is **not** splash protection — pair with a shield or use a fluid-resistant mask with attached visor.

### Doffing order (to avoid self-contamination)
1. Gloves
2. Goggles / face shield
3. Gown
4. Mask / respirator
5. Hand hygiene`,
      },
      {
        id: "bbp4",
        title: "Post-exposure protocol",
        type: "lesson",
        durationMinutes: 6,
        body: `Speed matters. Most bloodborne-pathogen transmissions can be prevented if you act within minutes.

### Step 1 — First aid (seconds)
- **Needlestick / cut:** wash with soap and water. Do not squeeze the wound or apply bleach.
- **Mucous membrane splash:** irrigate with water or sterile saline for at least 5 minutes.
- **Intact skin contamination:** wash thoroughly with soap and water.

### Step 2 — Report (within 1 hour)
- Notify your **supervisor or charge nurse** and call the **Employee Health line (ext. 2911)**.
- After hours, call the **Nursing Supervisor / House Officer**; they route to on-call Occupational Health.

### Step 3 — Source-patient testing
- Employee Health consents the source patient (or surrogate) for HIV, HBV, HCV testing — typically same day.
- You do **not** need the source patient's permission to proceed with your own testing and prophylaxis.

### Step 4 — PEP decision
- HIV PEP (typically tenofovir/emtricitabine + raltegravir) is most effective when started within **2 hours**; still offered up to 72 hours.
- HBV PEP depends on your vaccine status and the source's HBsAg.
- HCV: no PEP; baseline labs, follow-up at 6 weeks and 6 months.

### Step 5 — Document and follow up
- Incident report in the safety system
- Confidential lab follow-up at 6 weeks, 3 months, 6 months (employee's choice)
- Counseling available at no cost

> **You will not be charged for any testing, PEP medication, or follow-up related to an occupational exposure.**`,
      },
      {
        id: "bbp5",
        title: "Knowledge check",
        type: "quiz",
        durationMinutes: 6,
        questions: [
          {
            id: "bbpq1",
            prompt: "Which of the following should ALWAYS be treated as potentially infectious?",
            type: "single",
            options: [
              { id: "a", label: "Blood, regardless of source" },
              { id: "b", label: "Semen and vaginal secretions" },
              { id: "c", label: "Any visibly bloody body fluid" },
              { id: "d", label: "All of the above", correct: true },
            ],
            explanation: "Under Universal / Standard Precautions, all blood and OPIM are treated as potentially infectious.",
          },
          {
            id: "bbpq2",
            prompt: "A coworker is splashed in the eye with blood during a code. What is the correct first action?",
            type: "single",
            options: [
              { id: "a", label: "Finish the code, then go to the sink" },
              { id: "b", label: "Irrigate the eye with water or sterile saline for at least 5 minutes", correct: true },
              { id: "c", label: "Apply antibiotic drops" },
              { id: "d", label: "Call Infection Prevention first" },
            ],
            explanation: "Immediate irrigation for at least 5 minutes is the first step. Reporting and PEP come next.",
          },
          {
            id: "bbpq3",
            prompt: "How soon should an occupational blood exposure be reported at Meridian?",
            type: "single",
            options: [
              { id: "a", label: "Within 1 hour", correct: true },
              { id: "b", label: "By end of shift" },
              { id: "c", label: "Within 24 hours" },
              { id: "d", label: "Only if the source patient is high-risk" },
            ],
            explanation: "HIV PEP is most effective within 2 hours. Reporting within 1 hour preserves that window.",
          },
          {
            id: "bbpq4",
            prompt: "You may recap a needle using a two-handed technique if you are careful.",
            type: "true_false",
            options: [
              { id: "a", label: "True" },
              { id: "b", label: "False", correct: true },
            ],
            explanation: "Two-handed recapping is prohibited. If recapping is absolutely necessary, use a one-handed scoop or a mechanical device.",
          },
          {
            id: "bbpq5",
            prompt: "Which vaccine is offered (and required to be offered) by OSHA to at-risk workers at no cost?",
            type: "single",
            options: [
              { id: "a", label: "Hepatitis A" },
              { id: "b", label: "Hepatitis B", correct: true },
              { id: "c", label: "Hepatitis C (no vaccine exists)" },
              { id: "d", label: "HIV" },
            ],
            explanation: "OSHA requires Hepatitis B vaccine be offered within 10 working days of starting an at-risk role. HCV and HIV have no vaccine.",
          },
        ],
      },
    ],
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
    overview:
      "Musculoskeletal injuries are the single most common reason for workers' comp claims in healthcare and warehouse settings. This course walks through the biomechanics of a safe lift, when to stop and ask for help, and how to use Meridian's safe patient handling equipment correctly.",
    learningObjectives: [
      "Explain why bending at the waist increases spinal compression",
      "Apply the five-step safe-lift technique",
      "Recognize when a load exceeds individual capacity (the 35-lb rule)",
      "Select the right safe-patient-handling device for the task",
      "Identify early warning signs of injury and when to report",
    ],
    references: [
      "NIOSH Revised Lifting Equation (1994)",
      "ANA Safe Patient Handling and Mobility Standards",
      "Meridian Safe Patient Handling Policy — OHSP-204",
    ],
    modules: [
      {
        id: "bs1",
        title: "Why backs get hurt",
        type: "lesson",
        durationMinutes: 3,
        body: `Your spine is a stack of 33 vertebrae cushioned by discs. Those discs are not designed to absorb **shear** force — which is exactly what bending at the waist produces.

### The physics
- A 10-lb box held close to your body = ~10 lb on the spine.
- The same box held 15 inches away = ~150 lb on the spine.
- Add a twist and disc pressure increases another **400%**.

Most workplace back injuries are not caused by a single heroic lift. They're cumulative: hundreds of small bad-technique lifts over months and years.

### Early warning signs
- Tight, dull ache that shows up the day *after* heavy activity
- Pain that radiates down the buttock or leg (sciatica)
- Numbness or tingling in the thigh or foot
- Difficulty standing up straight after sitting

Report any of these to Employee Health early — catching it at week 2 is far easier than at week 12.`,
      },
      {
        id: "bs2",
        title: "The safe-lift technique",
        type: "lesson",
        durationMinutes: 4,
        body: `### The five steps of a safe lift
1. **Plan the lift.** Check the path, destination, and weight. Clear obstacles first.
2. **Get close.** Feet shoulder-width apart, one foot slightly ahead, directly over the load.
3. **Keep it close.** Hug the load in, tight to your belly. Every extra inch multiplies spinal force.
4. **Lift with the legs.** Bend knees and hips, keep the back straight, head up. Tighten your core before lifting.
5. **No twists.** Move your feet to turn, not your spine. Pivot, don't twist.

### The 35-lb rule (for patient handling)
NIOSH recommends a hard ceiling of **35 pounds** of manual patient-handling load per caregiver. Anything heavier requires a lift, sling, slider board, or second caregiver. This is not machismo territory — bad outcomes include permanent disability for both staff and patient.

### When to ask for help
- Over 35 lb and no equipment available → stop. Call the charge nurse or the SPHM team.
- Patient is agitated, combative, or uncooperative.
- You just can't see where you're going.`,
      },
      {
        id: "bs3",
        title: "Using safe-patient-handling equipment",
        type: "video",
        durationMinutes: 6,
        body: `Meridian has made a significant investment in safe-patient-handling (SPH) equipment. Using it is not optional — not using it counts as a deviation from policy.

### Available equipment
- **Ceiling lifts** — every acute care room, ICU, and OR recovery bay.
- **Portable floor lifts** — stored in the equipment bay of each unit.
- **Slider boards and friction-reducing sheets** — for lateral transfers.
- **Sit-to-stand devices** — for patients with some weight-bearing capacity.

### Quick decision guide
| Patient can… | Use |
| --- | --- |
| Fully bear weight and follow commands | Gait belt, stand-by assist |
| Partially bear weight, one or two caregivers | Sit-to-stand lift |
| Not bear weight, needs repositioning | Ceiling lift / floor lift |
| Needs lateral transfer only | Slider board + friction-reducing sheet |

Competency demonstrations are available every Wednesday in the simulation lab. Contact the SPH coordinator to schedule.`,
      },
      {
        id: "bs4",
        title: "Knowledge check",
        type: "quiz",
        durationMinutes: 5,
        questions: [
          {
            id: "bsq1",
            prompt: "The NIOSH guideline for maximum safe manual patient-handling load per caregiver is:",
            type: "single",
            options: [
              { id: "a", label: "25 lb" },
              { id: "b", label: "35 lb", correct: true },
              { id: "c", label: "50 lb" },
              { id: "d", label: "100 lb" },
            ],
            explanation: "NIOSH recommends 35 lb as a ceiling; Meridian policy mirrors this.",
          },
          {
            id: "bsq2",
            prompt: "Holding a 10-lb load away from your body (~15 inches) produces roughly how much force on your spine?",
            type: "single",
            options: [
              { id: "a", label: "10 lb" },
              { id: "b", label: "40 lb" },
              { id: "c", label: "150 lb", correct: true },
              { id: "d", label: "300 lb" },
            ],
            explanation: "Lever arm physics. Always keep the load close to your body.",
          },
          {
            id: "bsq3",
            prompt: "Twisting while lifting is fine if the load is under 20 lb.",
            type: "true_false",
            options: [
              { id: "a", label: "True" },
              { id: "b", label: "False", correct: true },
            ],
            explanation: "Any twist adds shear force to the discs. Pivot with your feet instead.",
          },
          {
            id: "bsq4",
            prompt: "A patient weighs 240 lb and can bear partial weight. Which device is appropriate?",
            type: "single",
            options: [
              { id: "a", label: "Manual transfer with a gait belt" },
              { id: "b", label: "Sit-to-stand lift", correct: true },
              { id: "c", label: "Two caregivers, manual transfer" },
              { id: "d", label: "No equipment needed" },
            ],
            explanation: "For partial weight-bearing patients, the sit-to-stand keeps staff out of the 35-lb danger zone.",
          },
        ],
      },
    ],
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
    overview:
      "In a healthcare facility, fire requires both immediate action and patient protection. Every Meridian staff member — clinical and non-clinical — is expected to know RACE, PASS, and their unit's evacuation routes. This module is published as a SCORM package, so launch it below to complete the interactive drill.",
    learningObjectives: [
      "Execute the RACE response in the first 60 seconds of a fire",
      "Select the correct fire extinguisher class (A/B/C/K) for the hazard",
      "Use a fire extinguisher with the PASS technique",
      "Locate your unit's primary and secondary evacuation routes",
      "Identify horizontal vs. vertical evacuation decision points",
    ],
    references: [
      "NFPA 99 — Health Care Facilities Code",
      "NFPA 101 — Life Safety Code",
      "Meridian Emergency Operations Plan, Annex C (Fire Response)",
    ],
    modules: [
      {
        id: "fs1",
        title: "RACE — the first 60 seconds",
        type: "lesson",
        durationMinutes: 5,
        body: `**RACE** is the universal memory aid for healthcare fire response. Execute in order, even if you think the fire is small.

### R — Rescue
Move anyone in **immediate danger** to safety. Horizontal first (same floor, through fire doors) before vertical. Do not use elevators.

### A — Alarm
**Pull the nearest pull station** and dial **ext. 11** (internal fire line). Be specific: location, what's burning, whether people are still inside.

### C — Contain
Close every door you pass. Close oxygen valves in the affected zone. Fire doors hold back flame, smoke, and heat for up to 90 minutes — enough time for a defend-in-place.

### P — Protect / Extinguish
Only if the fire is small (wastebasket-sized) and you have a clear exit behind you — use the extinguisher. Otherwise, evacuate and defend in place.

> **Healthcare defend-in-place:** unlike an office building, we rarely do a full evacuation. We protect patients where they are and let fire doors + the sprinkler system contain the incident.`,
      },
      {
        id: "fs2",
        title: "PASS — using an extinguisher",
        type: "lesson",
        durationMinutes: 3,
        body: `Stay between the fire and your exit. If the room fills with smoke or you can't see the fire through it, back out and close the door.

### PASS
- **Pull** the pin (breaks the tamper seal).
- **Aim** at the **base** of the flames, not the flames themselves.
- **Squeeze** the handle.
- **Sweep** side to side.

### Extinguisher classes at Meridian
| Class | Use on |
| --- | --- |
| **A** | Ordinary combustibles — paper, cloth, wood |
| **B** | Flammable liquids — alcohol-based hand sanitizer, fuel |
| **C** | Energized electrical |
| **K** | Kitchen grease (food services only) |

Every patient-care unit has ABC (tri-class) extinguishers every 75 feet. Kitchens also have a Class K system.

### After you use an extinguisher
Report it immediately — a used extinguisher must be taken out of service and replaced, even if partially discharged.`,
      },
      {
        id: "fs3",
        title: "Evacuation decisions",
        type: "lesson",
        durationMinutes: 4,
        body: `### Horizontal evacuation
Move patients through the nearest fire doors into the adjacent smoke compartment. Fire doors are rated to hold back a fire for at least 60 minutes. In most healthcare fires, horizontal evacuation is the right answer.

### Vertical evacuation
Down the nearest stairwell. Only do this when:
- The current floor is compromised AND the adjacent compartment is also compromised, OR
- You are directed by the Incident Commander or Fire Department.

### Patient acuity — who goes first?
1. **Ambulatory** — walk them out first. They can then help evacuate others.
2. **Wheelchair / non-ambulatory** — hospital sheets, blanket drags, evacuation chairs for stairs.
3. **Bed-bound / critical** — last, with the most staff.

### Accounting for people
Units maintain a real-time census. In the event of evacuation, the unit charge nurse brings the census / patient roster to the staging area and does a head count.`,
      },
      {
        id: "fs4",
        title: "Knowledge check",
        type: "quiz",
        durationMinutes: 5,
        questions: [
          {
            id: "fsq1",
            prompt: "What is the first letter of RACE for?",
            type: "single",
            options: [
              { id: "a", label: "Respond" },
              { id: "b", label: "Rescue", correct: true },
              { id: "c", label: "Reactivate" },
              { id: "d", label: "Retreat" },
            ],
            explanation: "R is for Rescue — move anyone in immediate danger first.",
          },
          {
            id: "fsq2",
            prompt: "Alcohol-based hand sanitizer fire is what class?",
            type: "single",
            options: [
              { id: "a", label: "Class A" },
              { id: "b", label: "Class B (flammable liquid)", correct: true },
              { id: "c", label: "Class C" },
              { id: "d", label: "Class K" },
            ],
            explanation: "Alcohol is a flammable liquid — Class B. Tri-class ABC extinguishers cover it.",
          },
          {
            id: "fsq3",
            prompt: "In healthcare, our default evacuation strategy is:",
            type: "single",
            options: [
              { id: "a", label: "Full vertical evacuation as soon as the alarm sounds" },
              { id: "b", label: "Horizontal evacuation and defend in place", correct: true },
              { id: "c", label: "Evacuate staff first, patients later" },
              { id: "d", label: "Wait for the fire department to make the call" },
            ],
            explanation: "We move patients horizontally into the next compartment and defend in place while fire doors and sprinklers contain the incident.",
          },
          {
            id: "fsq4",
            prompt: "You aim a fire extinguisher at:",
            type: "single",
            options: [
              { id: "a", label: "The top of the flames" },
              { id: "b", label: "The base of the flames", correct: true },
              { id: "c", label: "The ceiling" },
              { id: "d", label: "Whatever looks biggest" },
            ],
            explanation: "Aim at the fuel — the base — or you just blow flame around.",
          },
        ],
      },
    ],
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
    overview:
      "Hospital-acquired infections affect roughly 1 in 31 patients every day in the U.S. The interventions with the largest proven impact are also the simplest: clean hands, right PPE, right precautions, and early reporting. This course is required within 30 days of hire for every clinical role.",
    learningObjectives: [
      "Perform the CDC's 5 Moments of Hand Hygiene",
      "Differentiate Standard, Contact, Droplet, and Airborne precautions",
      "Don and doff PPE in the correct order",
      "Recognize when to escalate a possible outbreak to Infection Prevention",
      "Apply sharps and environmental cleaning protocols",
    ],
    references: [
      "CDC Guideline for Isolation Precautions (2007, updated)",
      "WHO 5 Moments for Hand Hygiene",
      "APIC Text of Infection Control and Epidemiology",
    ],
    modules: [
      {
        id: "ipc1",
        title: "The 5 Moments of Hand Hygiene",
        type: "lesson",
        durationMinutes: 5,
        body: `The WHO's **5 Moments for Hand Hygiene** are a simple, evidence-based framework. Audits show compliance averages around 40% globally — that's the gap between good intention and patient safety.

1. **Before** touching a patient
2. **Before** a clean or aseptic procedure
3. **After** body-fluid exposure risk
4. **After** touching a patient
5. **After** touching patient surroundings (bed rail, IV pump, overbed table)

### Product choice
- **Alcohol-based hand rub (ABHR):** default for routine hand hygiene. Faster, more effective against most pathogens than soap.
- **Soap and water:** required when hands are visibly soiled, after using the restroom, and for *C. difficile* or norovirus (alcohol doesn't kill spores).

### Technique
ABHR: cover all surfaces of hands and fingers, rub until dry (~20 seconds).
Soap: wet, lather, scrub all surfaces for at least 20 seconds, rinse, dry with towel, use towel to turn off faucet.

### Nails, rings, and watches
- Natural nails < 0.25 in, no artificial nails in direct patient care
- Remove rings with stones / grooves before donning gloves
- Watches and bracelets: removed or pushed above the wrist`,
      },
      {
        id: "ipc2",
        title: "Isolation precautions",
        type: "lesson",
        durationMinutes: 7,
        body: `### Standard Precautions (for every patient, every time)
- Hand hygiene
- PPE based on anticipated exposure
- Respiratory etiquette
- Safe injection practices
- Sharps disposal

### Contact Precautions
- **When:** MRSA, VRE, C. diff, ESBL, scabies, RSV, draining wounds
- **PPE:** gown + gloves upon entry
- **Room:** private or cohorted; dedicate equipment when possible

### Droplet Precautions
- **When:** influenza, pertussis, adenovirus, Neisseria meningitidis (first 24 hr of abx)
- **PPE:** surgical mask within 3–6 feet
- **Room:** private; door may remain open

### Airborne Precautions
- **When:** TB, measles, varicella, disseminated zoster, SARS-CoV-2 during aerosol-generating procedures
- **PPE:** fit-tested **N95** or higher
- **Room:** **Airborne Infection Isolation Room** (AIIR) with negative pressure; door closed

### Combined
- COVID-19 admitted patient: Contact + Droplet + Eye protection routinely; Airborne during AGPs.
- Ebola suspected: full PPE ensemble, team-based donning/doffing.

> When in doubt, **gown and mask** and call Infection Prevention (ext. 7788).`,
      },
      {
        id: "ipc3",
        title: "Donning and doffing PPE",
        type: "video",
        durationMinutes: 6,
        body: `Most self-contamination happens during **doffing**, not during patient care. Slow down.

### Donning order
1. Hand hygiene
2. Gown
3. Mask / respirator (fit check for N95)
4. Goggles / face shield
5. Gloves — pull over gown cuffs

### Doffing order (reverse, with care)
1. Gloves — peel off without touching skin, drop into waste
2. Hand hygiene
3. Goggles / face shield — handle by the band, not the front
4. Gown — untie, pull away from body, roll contaminated side in
5. Hand hygiene
6. Exit the room
7. Mask — handle by the ties or elastic, never the front
8. Final hand hygiene

### Reused PPE (extended use)
Goggles and face shields may be cleaned and reused per unit policy. Disposable gowns and gloves are single-use.`,
      },
      {
        id: "ipc4",
        title: "When to suspect an outbreak",
        type: "lesson",
        durationMinutes: 5,
        body: `An **outbreak** is two or more epidemiologically linked cases of the same organism above the expected baseline. You don't need to diagnose it — you need to *notice* it and report.

### Report to Infection Prevention (ext. 7788) when
- Two or more staff or patients develop similar GI symptoms on the same unit within 48 hours
- Unexpected cluster of any reportable disease (meningococcal, measles, TB, C. diff)
- A patient on isolation develops new unexplained fever
- Spike in surgical site infections on a specific service
- Any suspected needlestick with unusual circumstances

### Your role during an active outbreak
- Strict adherence to precautions for every patient on the affected unit (not just suspected cases)
- Cohort staffing if possible — same staff care for same patients
- Enhanced environmental cleaning with the correct agent (bleach for C. diff)
- Real-time line list contribution — note cases as they're identified

### Communication
Outbreak communication is coordinated through Infection Prevention and Public Affairs. Do not post on social media.`,
      },
      {
        id: "ipc5",
        title: "Knowledge check",
        type: "quiz",
        durationMinutes: 7,
        questions: [
          {
            id: "ipcq1",
            prompt: "You finish an assessment and step out of the patient's room to document. What hand-hygiene moment is this?",
            type: "single",
            options: [
              { id: "a", label: "Moment 3 (after body-fluid risk)" },
              { id: "b", label: "Moment 4 (after touching a patient)", correct: true },
              { id: "c", label: "Moment 5 (after touching surroundings)" },
              { id: "d", label: "None, you're just leaving the room" },
            ],
            explanation: "Leaving after patient contact = Moment 4. If you also touched contaminated surroundings on the way out you'd ALSO cover Moment 5 with the same hand hygiene.",
          },
          {
            id: "ipcq2",
            prompt: "C. difficile requires:",
            type: "single",
            options: [
              { id: "a", label: "ABHR only" },
              { id: "b", label: "Soap and water", correct: true },
              { id: "c", label: "Either one is fine" },
              { id: "d", label: "Chlorhexidine only" },
            ],
            explanation: "Alcohol does not kill C. difficile spores. Soap and water mechanical removal is required.",
          },
          {
            id: "ipcq3",
            prompt: "A patient is admitted with suspected pulmonary TB. Which precaution applies?",
            type: "single",
            options: [
              { id: "a", label: "Contact" },
              { id: "b", label: "Droplet" },
              { id: "c", label: "Airborne — N95 + AIIR", correct: true },
              { id: "d", label: "Standard only" },
            ],
            explanation: "TB is airborne. Fit-tested N95 (or higher) + negative-pressure room.",
          },
          {
            id: "ipcq4",
            prompt: "Which PPE is removed LAST when exiting an isolation room?",
            type: "single",
            options: [
              { id: "a", label: "Gown" },
              { id: "b", label: "Gloves" },
              { id: "c", label: "Goggles" },
              { id: "d", label: "Mask / respirator (after leaving)", correct: true },
            ],
            explanation: "Mask comes off after exiting the room to avoid self-contaminating with exhaled aerosols inside.",
          },
          {
            id: "ipcq5",
            prompt: "You notice three patients on your unit with new diarrhea in 24 hours. The best action is:",
            type: "single",
            options: [
              { id: "a", label: "Wait and see if a fourth develops it" },
              { id: "b", label: "Report to Infection Prevention", correct: true },
              { id: "c", label: "Start empirical antibiotics" },
              { id: "d", label: "Post about it in the unit group chat" },
            ],
            explanation: "Cluster + same symptom + same unit = report immediately. IP initiates the line list and testing strategy.",
          },
        ],
      },
    ],
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
    overview:
      "Every workforce member — employees, contractors, volunteers, students, and vendors with system access — attests annually that they've read and understand Meridian's Code of Conduct. Download the PDF, read the full document, then sign the attestation.",
    learningObjectives: [
      "Summarize the core values that guide decision-making at Meridian",
      "Identify conflicts of interest that must be disclosed",
      "Know how to use the confidential ethics line",
      "Understand that retaliation for good-faith reporting is prohibited",
    ],
    references: [
      "Meridian Code of Conduct (2026 revision)",
      "OIG Compliance Program Guidance for Hospitals",
      "HHS False Claims Act guidance",
    ],
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
    overview:
      "A four-session cohort-based program for people stepping into their first direct-report management role at Meridian. Led by Marcus Bell and a senior clinical leader, the sessions alternate between practical frameworks and supervised practice conversations. Between sessions you're expected to deliver two real feedback conversations and bring them back to the group.",
    learningObjectives: [
      "Run a one-on-one that gets past status reporting",
      "Deliver a direct piece of critical feedback without eroding trust",
      "Delegate a task cleanly — with context, constraints, and check-in cadence",
      "Hold a coaching conversation using the GROW model",
      "Spot early warning signs of a team member in trouble",
    ],
    references: [
      "Kim Scott, *Radical Candor*",
      "Julie Zhuo, *The Making of a Manager*",
      "Meridian Management Fundamentals handbook",
    ],
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
    overview:
      "Eight short questions. Your answers determine which safety modules are assigned to you this year — so you don't have to sit through training that isn't relevant to your role. Takes most people under two minutes.",
    learningObjectives: [
      "Accurately describe your occupational exposure risks",
      "Trigger the appropriate downstream safety training",
      "Give EH&S an up-to-date picture of role-based risk across the organization",
    ],
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
    overview:
      "Over 90% of security incidents still start with a phishing email. This course teaches the patterns attackers use, the two practical defenses that matter most (MFA + a password manager), and how to report a suspicious message so the security team can protect everyone else.",
    learningObjectives: [
      "Identify the four most common phishing categories (generic, spear, whaling, smishing)",
      "Spot five red flags in an email header and body",
      "Set up MFA on university and personal accounts",
      "Use a password manager for unique credentials",
      "Report a suspected phish in one click",
    ],
    references: [
      "NIST SP 800-63B Authentication Guidelines",
      "CISA #StopRansomware resources",
      "APWG Phishing Trends Report",
    ],
    modules: [
      {
        id: "ph1",
        title: "Anatomy of a phish",
        type: "lesson",
        durationMinutes: 5,
        body: `### The four categories you'll see
- **Generic phishing** — mass-sent, easy to spot. Fake package notifications, "your password expires in 24 hours".
- **Spear phishing** — targeted at you by name, referencing real projects or coworkers.
- **Whaling** — targeted at senior leaders. Often impersonates the CFO or provost.
- **Smishing / vishing** — phishing by SMS or phone. Often quotes a real caller ID.

### The five red flags
1. **Urgency or fear** — "your account will be locked in 30 minutes".
2. **Authority without verification** — "per the provost, wire the funds now".
3. **Mismatched sender** — display name says *Atlas IT Help* but the address is \`help-us@atIas.edu\` (capital I, not lowercase L).
4. **Unexpected link or attachment** — hover the link. Does the URL match the sender domain?
5. **Grammar / formatting oddities** — weird spacing, mixed fonts, generic greetings.

If any two of these apply, assume phish until verified through a known channel.`,
      },
      {
        id: "ph2",
        title: "MFA and password managers",
        type: "lesson",
        durationMinutes: 5,
        body: `### Why MFA is the single best defense
Even if an attacker steals your password, MFA blocks them from logging in. Microsoft and Google data show MFA blocks **>99% of account-compromise attempts**.

### Approved MFA methods at Atlas (in order of preference)
1. **Hardware security key** (YubiKey) — strongest, phishing-resistant
2. **Authenticator app** (Microsoft Authenticator, Google Authenticator) — rolling 6-digit codes
3. **Push notifications** via the Authenticator app
4. **SMS** — only allowed as a last resort; phishing-prone

### Password manager = one strong password for everything else
- Atlas provides **1Password** to every employee and student. See IT Self-Service.
- Generate unique, long (16+ char) passwords for every site.
- Never reuse your Atlas password anywhere else.

### If you think your credentials are compromised
- Change your password **immediately**.
- Revoke authenticator sessions from the account dashboard.
- Open a ticket with IT Security (ext. 4444). We'd rather hear about a false alarm than miss a real incident.`,
      },
      {
        id: "ph3",
        title: "Reporting a suspected phish",
        type: "lesson",
        durationMinutes: 4,
        body: `### One-click reporting
Outlook and Gmail at Atlas both have a **Report Phish** button. Click it. That sends the message to IT Security and removes it from your inbox.

### What happens next
- Security reviews the message. If confirmed malicious, we:
  1. Block the sender domain
  2. Search every inbox for copies and remove them (retroactive remediation)
  3. Reset any accounts where someone clicked
- You get a "thanks, we got it" auto-response with a tracking number.

### False positives are fine
If you're not sure, click **Report Phish** anyway. We'd rather false-positive ten legitimate emails than miss one phish. Reporters are never penalized.

### Simulated phishing
Atlas runs an ongoing simulated-phishing program. If you click a simulation, you'll land on a training page — not get in trouble. Repeated clicks trigger targeted coaching. The goal is muscle memory, not punishment.`,
      },
      {
        id: "ph4",
        title: "Knowledge check",
        type: "quiz",
        durationMinutes: 6,
        questions: [
          {
            id: "phq1",
            prompt: "An email from 'Provost Jane Doe <jane.doe@at1as.edu>' asks you to buy $500 in gift cards for a 'donor thank-you'. What's the red flag?",
            type: "single",
            options: [
              { id: "a", label: "The request itself (urgency + unusual)" },
              { id: "b", label: "The domain uses a '1' instead of 'l' (lookalike)" },
              { id: "c", label: "Gift cards are a classic social-engineering target" },
              { id: "d", label: "All of the above", correct: true },
            ],
            explanation: "Classic whaling: authority, urgency, lookalike domain, gift card payment. Report immediately.",
          },
          {
            id: "phq2",
            prompt: "Which MFA method is most phishing-resistant?",
            type: "single",
            options: [
              { id: "a", label: "SMS text code" },
              { id: "b", label: "Authenticator app push" },
              { id: "c", label: "Hardware security key (FIDO2/WebAuthn)", correct: true },
              { id: "d", label: "Recovery email" },
            ],
            explanation: "Hardware keys bind to the real domain; phishing sites can't relay the challenge.",
          },
          {
            id: "phq3",
            prompt: "You clicked a link in a suspicious email and entered your password. First step?",
            type: "single",
            options: [
              { id: "a", label: "Turn off your computer" },
              { id: "b", label: "Change your password and call IT Security", correct: true },
              { id: "c", label: "Wait and see if anything bad happens" },
              { id: "d", label: "Delete the email" },
            ],
            explanation: "Rotate the credential, report immediately. IT Security does the rest.",
          },
          {
            id: "phq4",
            prompt: "Reporting a suspicious email that turns out to be legitimate will get you in trouble.",
            type: "true_false",
            options: [
              { id: "a", label: "True" },
              { id: "b", label: "False", correct: true },
            ],
            explanation: "We actively encourage false positives — muscle memory is the goal.",
          },
        ],
      },
    ],
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
    overview:
      "Required training for anyone conducting human-subjects research at Atlas — PIs, co-investigators, research coordinators, and students collecting identifiable data. Covers the historical context that shaped the current framework, the Belmont Report principles, and the practical mechanics of IRB submission and consent.",
    learningObjectives: [
      "Describe the historical events that led to modern research ethics (Nuremberg, Tuskegee, Willowbrook)",
      "Apply the three Belmont principles to research design choices",
      "Determine IRB review category (exempt, expedited, full board)",
      "Construct a consent process that genuinely supports understanding",
      "Recognize additional protections required for vulnerable populations",
    ],
    references: [
      "The Belmont Report (1979)",
      "45 CFR 46 (Common Rule), revised 2018",
      "HHS Office for Human Research Protections (OHRP) guidance",
    ],
    modules: [
      {
        id: "irb1",
        title: "Why we have an IRB",
        type: "lesson",
        durationMinutes: 8,
        body: `Modern human-subjects protections are a direct response to ethical failures in the 20th century.

### Nuremberg (1947)
Nazi experimentation prosecuted at Nuremberg produced the **Nuremberg Code** — the first articulation of voluntary informed consent.

### Tuskegee (1932–1972)
U.S. Public Health Service left 399 Black men with syphilis untreated for 40 years, withholding penicillin even after it became standard of care. Led to the **National Research Act (1974)** and the creation of IRBs.

### Willowbrook (1956–1971)
Children with intellectual disabilities were intentionally infected with hepatitis to study transmission. Consent was obtained from parents in exchange for admission to a crowded institution — coercion disguised as choice.

### The Belmont Report (1979)
Three foundational principles still guide every IRB decision today:
1. **Respect for Persons** — informed consent, extra protections for those with reduced autonomy
2. **Beneficence** — maximize benefits, minimize harms; favorable risk-benefit balance
3. **Justice** — fair selection of subjects, equitable distribution of benefits and burdens

These aren't abstract philosophy. Every IRB protocol review is structured around them.`,
      },
      {
        id: "irb2",
        title: "Categories of IRB review",
        type: "lesson",
        durationMinutes: 8,
        body: `### Exempt
Research with minimal risk that fits one of the defined categories (anonymous surveys, analysis of existing de-identified data, certain educational tests). Still requires IRB determination — **you** don't get to decide it's exempt.

### Expedited
Minimal-risk research that doesn't fit exempt categories (e.g. non-invasive procedures, collection of hair or saliva, low-risk interviews). Reviewed by a single designated IRB member.

### Full Board
Anything more than minimal risk, or involving vulnerable populations, or with substantial identifiability concerns. Convened IRB meets monthly.

### Minimal risk definition
The probability and magnitude of harm are "not greater than those ordinarily encountered in daily life or during routine physical or psychological examinations or tests." This is a legal definition, not a feeling — see §46.102(j).

### What gets you kicked back
- Consent form in 14-point legalese
- Risks section that says "none" (there's always *something*)
- No data-security plan for identifiable data
- Inclusion/exclusion criteria that look like cherry-picking`,
      },
      {
        id: "irb3",
        title: "Informed consent done right",
        type: "lesson",
        durationMinutes: 9,
        body: `Consent is a **process**, not a form. The form documents that the process happened.

### Required elements (§46.116)
- A statement that the study involves research
- Purpose, expected duration, procedures (plain language)
- Foreseeable risks and discomforts
- Reasonably expected benefits
- Alternatives (especially for clinical research)
- Confidentiality protections and their limits
- Compensation and whom to contact for questions or injury
- That participation is **voluntary** and can be withdrawn at any time without penalty

### Additional elements (§46.116(c)) when applicable
- Unforeseeable risks
- Circumstances under which the investigator may withdraw the subject
- Costs to the subject
- Consequences of withdrawal
- New findings that may affect willingness to continue
- Total number of subjects

### Readability
Aim for 6th-8th grade reading level. Use a readability tool. Short sentences. Second person. Define jargon in parentheses.

### The teach-back
For complex protocols, ask the subject to summarize back what they've just agreed to. If they can't, pause, clarify, and re-consent.`,
      },
      {
        id: "irb4",
        title: "Vulnerable populations",
        type: "lesson",
        durationMinutes: 8,
        body: `Subparts B, C, and D of 45 CFR 46 provide additional protections:

### Subpart B — Pregnant women, fetuses, neonates
- Preclinical studies in pregnant animals usually required
- Risk to fetus either minimized or directly benefits the pregnancy
- No financial inducements to terminate a pregnancy

### Subpart C — Prisoners
- Research must meet specific categories (e.g., conditions particularly affecting prisoners)
- Prisoner representative serves on the IRB
- Parole boards cannot use participation as a factor

### Subpart D — Children
- Minimal risk (§46.404), greater than minimal risk with direct benefit (§46.405), or a minor increase over minimal risk in studying the child's condition (§46.406)
- Parental permission AND child's assent required (assent usually around age 7+)
- DHHS Secretary's panel review for §46.407

### Other populations requiring care
- Decisionally impaired adults — surrogate consent processes
- Economically or educationally disadvantaged — avoid coercion via compensation or access
- Employees or students of the investigator — minimize pressure to participate`,
      },
      {
        id: "irb5",
        title: "Knowledge check",
        type: "quiz",
        durationMinutes: 10,
        questions: [
          {
            id: "irbq1",
            prompt: "Which Belmont principle most directly requires informed consent?",
            type: "single",
            options: [
              { id: "a", label: "Beneficence" },
              { id: "b", label: "Justice" },
              { id: "c", label: "Respect for Persons", correct: true },
              { id: "d", label: "Autonomy (a separate fourth principle)" },
            ],
            explanation: "Respect for Persons grounds voluntary, informed consent and extra protections for those with reduced autonomy.",
          },
          {
            id: "irbq2",
            prompt: "You're analyzing fully de-identified existing patient survey data. The review category is most likely:",
            type: "single",
            options: [
              { id: "a", label: "Exempt (pending IRB determination)", correct: true },
              { id: "b", label: "Expedited" },
              { id: "c", label: "Full board" },
              { id: "d", label: "No IRB involvement needed" },
            ],
            explanation: "Anonymous / de-identified data often falls under exempt, but the IRB — not you — makes the determination.",
          },
          {
            id: "irbq3",
            prompt: "A study recruits children ages 10–14. What's typically required?",
            type: "single",
            options: [
              { id: "a", label: "Parental permission only" },
              { id: "b", label: "Child's verbal agreement only" },
              { id: "c", label: "Parental permission AND child's assent", correct: true },
              { id: "d", label: "A waiver from the PI" },
            ],
            explanation: "Subpart D — both parental permission and child's assent are required (assent ~age 7+).",
          },
          {
            id: "irbq4",
            prompt: "A consent form includes the sentence: 'This study has no risks.' That's acceptable when:",
            type: "single",
            options: [
              { id: "a", label: "The study is survey-based" },
              { id: "b", label: "The PI is senior faculty" },
              { id: "c", label: "Never — there's always at least a privacy risk", correct: true },
              { id: "d", label: "When the IRB determines exempt status" },
            ],
            explanation: "Even anonymous studies carry a privacy or re-identification risk. Honest risk disclosure is required.",
          },
          {
            id: "irbq5",
            prompt: "Pays $500 to unhoused men to enroll in a drug-response study. Likely Belmont concern?",
            type: "single",
            options: [
              { id: "a", label: "Beneficence" },
              { id: "b", label: "Justice — inequitable selection and undue inducement", correct: true },
              { id: "c", label: "Respect for Persons" },
              { id: "d", label: "No concern" },
            ],
            explanation: "Targeted recruitment of economically disadvantaged people plus an amount that may compromise voluntariness = Justice concern.",
          },
        ],
      },
    ],
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
    overview:
      "As a 'Responsible Employee' at Atlas, you have a federal obligation to report disclosures of sexual harassment, sexual assault, dating violence, domestic violence, and stalking to the Title IX office. This course covers what triggers the obligation, how to receive a disclosure with care, and the supportive measures available to complainants.",
    learningObjectives: [
      "Recognize what counts as Title IX conduct",
      "Understand your status as a Responsible Employee and the reporting obligation",
      "Respond to a disclosure in a trauma-informed way",
      "Explain supportive measures available regardless of whether a formal complaint is filed",
      "Know the Clery Act obligations and their interaction with Title IX",
    ],
    references: [
      "Title IX of the Education Amendments of 1972",
      "34 CFR Part 106 (2024 final rule)",
      "Jeanne Clery Disclosure of Campus Security Policy and Crime Statistics Act",
    ],
    modules: [
      {
        id: "t9_1",
        title: "Scope of Title IX",
        type: "lesson",
        durationMinutes: 7,
        body: `Title IX prohibits **sex discrimination** in any education program or activity that receives federal financial assistance. Over time the definition has expanded to cover:

- **Sexual harassment** — unwelcome conduct that is severe, pervasive, or objectively offensive and denies equal educational access
- **Sexual assault** — any sexual act directed against another person without consent
- **Dating violence, domestic violence, stalking** — as defined by the Clery Act (VAWA amendments)
- **Pregnancy discrimination** — including lactation accommodations
- **Retaliation** — against anyone who reports or participates in a process

### Where it applies
On-campus and off-campus activity that is part of an Atlas program (study abroad, internships, athletic travel, university-sponsored events). Some off-campus conduct outside these contexts may still create a hostile educational environment; when in doubt, report.

### Who's protected
Students, employees, applicants, and third parties participating in Atlas programs — regardless of sex, gender, gender identity, or sexual orientation.`,
      },
      {
        id: "t9_2",
        title: "You are a Responsible Employee",
        type: "lesson",
        durationMinutes: 8,
        body: `At Atlas, all faculty and staff except **designated Confidential Resources** are Responsible Employees. That means:

- When a student tells you about conduct that may be sex-based misconduct, you **must** share it with the Title IX Coordinator.
- This is NOT a choice about whether to believe or to assess severity. You report; the Title IX office decides.
- You do NOT control whether a formal investigation happens — the complainant does (with narrow exceptions for safety).

### Confidential Resources (who do NOT have to report)
- Counseling and Psychological Services (CAPS)
- Ombudsperson
- Clergy / spiritual advisors
- Student Health clinicians
- Licensed attorneys advising the student

Tell students about these options **before** they start disclosing, so they can make an informed choice about whom to tell.

### If you get it wrong
Failure to report, or discouraging someone from reporting, is itself a Title IX violation and can lead to discipline up to termination. Errors are usually discoverable because another witness or document names you.`,
      },
      {
        id: "t9_3",
        title: "Receiving a disclosure well",
        type: "lesson",
        durationMinutes: 9,
        body: `How you receive the first disclosure matters enormously. The goal is to be warm, truthful about your reporting obligation, and calm.

### Do
- Give the student your full attention. Put down the phone. Move somewhere private.
- Say something like: *"I'm sorry this happened. Before you go further, I need to tell you that as a faculty member I'm required to share what you tell me with the Title IX office. They'll reach out with options and supportive measures. If you'd like to keep this confidential, I can connect you with the Ombuds or CAPS."*
- Let the student choose how much to say after that disclosure.
- Ask what they'd like you to do next.
- Let them know supportive measures are available even without a formal complaint.

### Don't
- Promise confidentiality.
- Ask why they were wearing X, or drinking, or why they went to the party.
- Pressure them to file a formal complaint.
- Contact the respondent yourself.
- Post on social media or tell colleagues who don't need to know.

### After the conversation
- Document the facts of the disclosure (who, what, when, where, any safety concerns).
- Report to the Title IX Coordinator within 24 hours — by phone, form, or email.
- Do NOT investigate.`,
      },
      {
        id: "t9_4",
        title: "Supportive measures",
        type: "lesson",
        durationMinutes: 6,
        body: `Supportive measures are non-disciplinary, non-punitive accommodations offered regardless of whether a formal complaint is filed.

Examples:
- No-contact orders
- Course section changes or online alternatives
- Housing reassignment
- Adjusted deadlines or grading timelines
- Escort services
- Counseling referrals
- Work schedule or reporting-line adjustments (for employee complainants)

They're voluntary. The Title IX office, not you, arranges them. But knowing they exist means you can tell a student something more helpful than "I'm sorry, I have to report this".`,
      },
      {
        id: "t9_5",
        title: "Knowledge check",
        type: "quiz",
        durationMinutes: 8,
        questions: [
          {
            id: "t9q1",
            prompt: "A student starts describing unwanted touching by another student. You should:",
            type: "single",
            options: [
              { id: "a", label: "Listen without interrupting, then report to Title IX" },
              { id: "b", label: "Stop them, explain you're a Responsible Employee, offer confidential options, then listen to what they choose to share", correct: true },
              { id: "c", label: "Tell them to come back later when you have more time" },
              { id: "d", label: "Investigate the claim yourself first" },
            ],
            explanation: "Be transparent about your reporting role BEFORE they disclose more. That lets them make an informed choice.",
          },
          {
            id: "t9q2",
            prompt: "Which of these are Confidential Resources at Atlas?",
            type: "single",
            options: [
              { id: "a", label: "CAPS counselors and the Ombudsperson", correct: true },
              { id: "b", label: "Academic advisors" },
              { id: "c", label: "Athletics coaches" },
              { id: "d", label: "Resident advisors" },
            ],
            explanation: "CAPS and Ombuds are Confidential. Faculty, advisors, and RAs are Responsible Employees.",
          },
          {
            id: "t9q3",
            prompt: "A complainant can receive supportive measures without filing a formal complaint.",
            type: "true_false",
            options: [
              { id: "a", label: "True", correct: true },
              { id: "b", label: "False" },
            ],
            explanation: "Supportive measures are available regardless of whether a formal complaint is filed.",
          },
          {
            id: "t9q4",
            prompt: "A student asks you to keep their disclosure completely confidential. You should:",
            type: "single",
            options: [
              { id: "a", label: "Agree so they'll feel comfortable" },
              { id: "b", label: "Explain you can't, but you can connect them with a Confidential Resource", correct: true },
              { id: "c", label: "Tell them they must file a formal complaint" },
              { id: "d", label: "Share only with their advisor" },
            ],
            explanation: "As a Responsible Employee you must report. Offer the Confidential Resource path up front.",
          },
        ],
      },
    ],
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
    overview:
      "OSHA requires formal certification before an employee may operate a powered industrial truck — and a practical evaluation at least every three years. This course has a classroom portion (below), then a supervised practical evaluation on the floor. Upload your signed evaluation form as evidence to complete.",
    learningObjectives: [
      "Identify the seven forklift classes and the fuel/lift differences",
      "Execute pre-shift inspection using the Northwind checklist",
      "Calculate load capacity given load center and attachment",
      "Apply stability-triangle principles to avoid tip-overs",
      "Pass the on-floor practical evaluation",
    ],
    references: [
      "29 CFR 1910.178 — Powered Industrial Trucks",
      "ANSI/ITSDF B56.1 — Safety Standard for Low Lift and High Lift Trucks",
      "Northwind Warehouse Safety Manual, Chapter 6",
    ],
    modules: [
      {
        id: "fl1",
        title: "Forklift classes and fuel",
        type: "lesson",
        durationMinutes: 10,
        body: `OSHA recognizes **seven classes** of powered industrial trucks. Certification is class-specific — a license for a Class II order picker does not authorize you to operate a Class VII rough-terrain lift.

| Class | Example | Power |
| --- | --- | --- |
| I | Electric motor rider | Battery |
| II | Electric narrow aisle | Battery |
| III | Electric hand / hand-rider | Battery |
| IV | Internal combustion, cushion tire | Propane/gas |
| V | Internal combustion, pneumatic tire | Propane/diesel |
| VI | Electric/IC tractors | Varies |
| VII | Rough terrain | Diesel |

### Fuel safety reminders
- **Propane tank changes** happen outdoors or in a ventilated area. Wear gloves, eye protection, long sleeves.
- **Battery charging** produces hydrogen gas — no smoking, no open flame, good ventilation.
- **Battery changing** requires PPE (rubber apron, gloves, face shield) and proper lifting gear. Batteries are heavy and leak.`,
      },
      {
        id: "fl2",
        title: "Pre-shift inspection",
        type: "lesson",
        durationMinutes: 8,
        body: `A complete pre-shift inspection takes about 5 minutes. Never skip it — a missed hydraulic leak ended in a tip-over at our Fort Worth terminal in 2024.

### Visual — engine off
- Tire condition and pressure
- Leaks under the truck (oil, hydraulic, coolant)
- Forks for cracks, bending, uneven height
- Mast chains equal tension, no kinks
- Overhead guard and backrest extension in place
- Horn, lights, seat belt, data plate legible

### Functional — engine on
- Brakes (foot and parking)
- Steering (full left/right, no slop)
- Hydraulics — raise, lower, tilt, sideshift
- Horn, lights, backup alarm
- Gauges and warning lights clear

If anything fails, **tag out of service** and notify your supervisor. Do not operate a defective truck.`,
      },
      {
        id: "fl3",
        title: "Load capacity and the stability triangle",
        type: "lesson",
        durationMinutes: 10,
        body: `### The data plate
Never exceed the rated capacity on the data plate. Capacity assumes:
- Standard **24-inch load center** (distance from the face of the forks to the center of gravity of the load)
- No attachment (attachments reduce capacity)

### Load center math
If the load center is 36 inches instead of 24, the safe capacity drops roughly proportionally. A 5,000-lb truck rated at a 24-in center may only carry ~3,300 lb at a 36-in center. Always check the de-rated capacity in the Northwind manual or call your supervisor.

### Stability triangle
A sit-down counterbalance forklift has three points of contact with the ground: the two front wheels and the center of the rear axle. The line connecting these three points forms the **stability triangle**. The combined center of gravity of truck + load must stay inside that triangle.

What takes it outside:
- Turning with the load raised
- Traveling with load raised
- Sudden stops or starts
- Uneven floor or slopes
- Overloaded forks

### Travel rules
- Forks 4–6 inches off the ground
- Mast tilted slightly back
- Slow on turns; horn at blind corners
- Travel in reverse when load obstructs view
- Seat belt fastened — every time`,
      },
      {
        id: "fl4",
        title: "Evidence: practical evaluation",
        type: "attestation",
        durationMinutes: 30,
        body: `### What you need to do
1. Print or download the **Practical Evaluation Form (PE-101)** from the Northwind intranet.
2. Schedule a supervised evaluation with your shift lead or any certified trainer.
3. Complete all 12 maneuvers on the form (pre-shift inspection, lift and lower, navigate pallet rack, narrow-aisle turn, ramp ascent/descent with load, emergency stop).
4. The evaluator signs, dates, and notes any deficiencies.
5. Scan or photograph the signed form and upload it as evidence.

### Evaluation must be completed within 30 days of starting the classroom portion. Your certification is valid for 36 months from the evaluation date.`,
      },
      {
        id: "fl5",
        title: "Knowledge check",
        type: "quiz",
        durationMinutes: 7,
        questions: [
          {
            id: "flq1",
            prompt: "The data plate capacity assumes a load center of:",
            type: "single",
            options: [
              { id: "a", label: "12 inches" },
              { id: "b", label: "18 inches" },
              { id: "c", label: "24 inches", correct: true },
              { id: "d", label: "36 inches" },
            ],
            explanation: "Standard is 24 inches. Attachments and off-center loads reduce rated capacity.",
          },
          {
            id: "flq2",
            prompt: "Traveling with a raised load is acceptable if you move slowly.",
            type: "true_false",
            options: [
              { id: "a", label: "True" },
              { id: "b", label: "False", correct: true },
            ],
            explanation: "Carry loads at 4–6 inches. Raising the load in motion shifts the center of gravity outside the stability triangle.",
          },
          {
            id: "flq3",
            prompt: "Certification must be renewed at least every:",
            type: "single",
            options: [
              { id: "a", label: "1 year" },
              { id: "b", label: "2 years" },
              { id: "c", label: "3 years", correct: true },
              { id: "d", label: "5 years" },
            ],
            explanation: "OSHA requires evaluation at least every 3 years, or sooner after an incident or observed unsafe operation.",
          },
          {
            id: "flq4",
            prompt: "During pre-shift, you find a small hydraulic leak. What should you do?",
            type: "single",
            options: [
              { id: "a", label: "Operate carefully for the shift and report at the end" },
              { id: "b", label: "Tag out and report immediately", correct: true },
              { id: "c", label: "Add fluid and continue" },
              { id: "d", label: "Ignore if the leak is small" },
            ],
            explanation: "Any defect tags the truck out of service. Hydraulic failure can cause immediate load drop.",
          },
        ],
      },
    ],
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
    overview:
      "Annual defensive driving recertification for Northwind CDL drivers. Covers Smith System, FMCSA Hours of Service, skid recovery, and the two pre-trip checks that catch 80% of roadside defects. Complete the modules and the quiz before your next dispatch.",
    learningObjectives: [
      "Apply the five keys of the Smith System",
      "Calculate required following distance by speed and load",
      "Recognize and recover from a trailer jackknife or skid",
      "Understand Hours of Service (HOS) rules and e-log compliance",
      "Execute a DOT-compliant pre-trip inspection in under 15 minutes",
    ],
    references: [
      "FMCSA 49 CFR Part 395 — Hours of Service",
      "Smith System training materials",
      "Northwind Fleet Safety Policy FS-301",
    ],
    modules: [
      {
        id: "dd1",
        title: "The five keys of the Smith System",
        type: "lesson",
        durationMinutes: 8,
        body: `The Smith System is the industry-standard defensive driving framework — memorize all five.

1. **Aim high in steering.** Look 15 seconds ahead (about a quarter-mile at highway speed). Most rear-end collisions happen because drivers are watching the vehicle immediately in front.
2. **Get the big picture.** Check mirrors every 5–8 seconds. Scan 360°. Know what's in your blind spots before you change lanes.
3. **Keep your eyes moving.** Don't fixate. Eye movement every 2 seconds keeps your brain engaged and catches peripheral hazards.
4. **Leave yourself an out.** Always have a planned escape. Don't get boxed in by traffic.
5. **Make sure they see you.** Use signals early, use headlights at dusk, tap the horn at blind corners. Never assume another driver has seen you.

### Following distance rule
- Normal conditions: **1 second per 10 feet of vehicle length**, plus 1 second if over 40 mph.
- A 70-ft tractor-trailer at 60 mph needs at least 8 seconds.
- Add seconds for rain (double), snow (triple), or worn tires.`,
      },
      {
        id: "dd2",
        title: "Pre-trip inspection",
        type: "lesson",
        durationMinutes: 10,
        body: `FMCSA requires a pre-trip inspection before every driving shift. At Northwind, we want you doing it in under **15 minutes** using the DVIR app.

### The Seven-Step method
1. **Vehicle overview** — walk around, look for damage, leans, leaks
2. **Check under the hood** — oil, coolant, power steering, windshield wash, belts, hoses, steering linkage
3. **Inside the cab** — seat belt, gauges, mirrors, defroster, wipers, horn; start engine and listen
4. **Lights** — all exterior lights (head, tail, brake, turn, marker), reflectors clean
5. **Air brakes** — leak-down test, low-air warning, emergency brake application
6. **Walk-around** — tires (tread depth 4/32 steer, 2/32 drive/trailer), wheels, fifth wheel, kingpin, trailer connections
7. **Signal / brake check** — have a partner confirm or use the in-cab camera feature

### Findings
- Critical defect — do not drive. DVIR out of service; call dispatch.
- Non-critical — document in the DVIR; mechanic addresses within 24 hrs.`,
      },
      {
        id: "dd3",
        title: "Skid and jackknife recovery",
        type: "lesson",
        durationMinutes: 8,
        body: `### Preventing skids
- Slow before the turn, not during
- Gear down before downhill grades (engine brake)
- Gentle steering input — no jerking
- Never slam brakes on slick surfaces

### Drive-wheel skid (rear end slides out)
1. **Ease off the throttle** and clutch — don't brake
2. **Counter-steer gently** in the direction you want the front of the vehicle to go
3. As traction returns, straighten the wheel
4. Resume slow acceleration

### Front-wheel skid (won't steer)
- You're probably going too fast for conditions
- Ease off, let speed decrease until front tires regain grip
- Then steer

### Trailer jackknife
- Early warning: trailer tires fishtailing in mirrors
- Release the brakes, straighten the steer
- NEVER jam on the brakes during a jackknife — it locks in the skid

### Winter shout-out
Black ice is invisible — bridges and shaded spots freeze first. If the spray from tires ahead disappears, ice is likely.`,
      },
      {
        id: "dd4",
        title: "Hours of Service",
        type: "lesson",
        durationMinutes: 9,
        body: `Fatigue is the leading cause of preventable CMV crashes. FMCSA HOS rules are there to keep you alive.

### Property-carrying CMV (your rig)
- **11 hours driving** max, after 10 consecutive off-duty
- **14-hour on-duty window** — once you start, you have 14 hours to get 11 hours of driving in
- **30-minute break** required after 8 cumulative hours of driving
- **60/70-hour rule** — no driving after 60 hours in 7 days or 70 in 8
- **Restart** — 34 consecutive hours off-duty resets the 60/70 clock

### Adverse conditions exception
Extends driving by up to 2 hours when conditions (fog, heavy snow, unexpected road closure) were not known at the start of the run.

### E-logs
Northwind uses KeepTruckin for electronic logging. Manual edits require a note and are reviewed by Safety. Don't fudge the log — FMCSA audits happen.

### Fatigue is a safety signal
If you're fatigued, pull off. Use a rest area, truck stop, or terminal. "Pushing through" is how crashes happen. Dispatch will reschedule — we'd rather lose the load.`,
      },
      {
        id: "dd5",
        title: "Knowledge check",
        type: "quiz",
        durationMinutes: 10,
        questions: [
          {
            id: "ddq1",
            prompt: "You're driving a 70-ft rig at 65 mph on dry road. Minimum following distance:",
            type: "single",
            options: [
              { id: "a", label: "4 seconds" },
              { id: "b", label: "6 seconds" },
              { id: "c", label: "8 seconds", correct: true },
              { id: "d", label: "12 seconds" },
            ],
            explanation: "1 second per 10 ft = 7 seconds, +1 for over 40 mph = 8 seconds minimum on dry road.",
          },
          {
            id: "ddq2",
            prompt: "The maximum driving hours after 10 consecutive off-duty hours is:",
            type: "single",
            options: [
              { id: "a", label: "10 hours" },
              { id: "b", label: "11 hours", correct: true },
              { id: "c", label: "14 hours" },
              { id: "d", label: "No limit if rested" },
            ],
            explanation: "11 driving hours within a 14-hour on-duty window.",
          },
          {
            id: "ddq3",
            prompt: "Trailer starts fishtailing. First action?",
            type: "single",
            options: [
              { id: "a", label: "Slam on the brakes" },
              { id: "b", label: "Release the brakes and straighten steering", correct: true },
              { id: "c", label: "Accelerate to pull the trailer straight" },
              { id: "d", label: "Swerve hard into the skid" },
            ],
            explanation: "Hard braking locks in a jackknife. Release brakes, straighten the steer.",
          },
          {
            id: "ddq4",
            prompt: "Minimum tread depth on steer tires per FMCSA:",
            type: "single",
            options: [
              { id: "a", label: "2/32 inch" },
              { id: "b", label: "4/32 inch", correct: true },
              { id: "c", label: "6/32 inch" },
              { id: "d", label: "8/32 inch" },
            ],
            explanation: "4/32 for steer axle, 2/32 for all other tires.",
          },
          {
            id: "ddq5",
            prompt: "You feel drowsy 5 hours into your shift. Correct action:",
            type: "single",
            options: [
              { id: "a", label: "Roll the window down and push through" },
              { id: "b", label: "Turn up the radio" },
              { id: "c", label: "Pull off safely and rest; notify dispatch", correct: true },
              { id: "d", label: "Drink extra coffee and continue" },
            ],
            explanation: "Pulling off and notifying dispatch is always the right call. We'd rather delay than crash.",
          },
        ],
      },
    ],
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
