# Northstar LXP

> A visual, multi-tenant learning experience platform for compliance, credentialing, and professional development. Training that feels like a journey, not a spreadsheet.

<p align="center">
  <em>Role-isolated workspaces · Interactive journey maps · AI-assisted assignment · Credential tracking · Real SaaS architecture</em>
</p>

---

## What this is

Northstar LXP is a full-stack SaaS application — not a wireframe — built as a Next.js 15 application with strict role isolation, a visual flagship learner experience, and a database schema ready for Supabase/Postgres deployment. It combines the role-isolation of Canvas, the compliance muscle of Bridge/Oracle Learn, and the visual polish of a modern SaaS dashboard.

### Quick demo

```bash
npm install
npm run dev
# open http://localhost:3000
```

From the home page, click **Try the demo** and pick any persona — Super Admin, Org Admin, Workspace Admin, Manager, or Learner. Each persona lands in a fully role-isolated experience.

### The five personas pre-seeded

| Persona | Demo user | What you'll see |
|--------|-----------|-----------------|
| **Platform Super Admin** | Ivy Chen | Tenant tiles for every organization, platform health, audit log, impersonation controls |
| **Organization Admin** | Jordan Alvarez (Meridian Health) | Workspace tiles, organizational learning paths, catalog, org reports, AI review queue |
| **Workspace Admin** | Priya Nair (EH&S) | Courses, paths, surveys, smart groups, assignments, workspace-scoped reports |
| **People Manager** | Elena Ruiz (ICU) | 5 direct reports, team compliance health, expiring credentials, drill-in to learner records |
| **Learner** | Sam Okafor (new hire RN) | Visual learning journey map, assigned courses, certificates, optional development |

---

## Architecture

### Tech stack

- **Next.js 15** (App Router, React 19, Server Components, Server Actions)
- **TypeScript** (strict)
- **Tailwind CSS 3** + `tailwindcss-animate`
- **Radix UI primitives** (accessible, unstyled headless)
- **Custom component library** in `src/components/ui/*` (shadcn-style)
- **lucide-react** for iconography
- **Recharts** for analytics
- **Data layer** — in-memory TypeScript module with rich seed data, designed to be swapped for a Supabase client without touching page code
- **Database schema** — Postgres / Supabase in `db/schema.sql` + RLS policies in `db/policies.sql`

### Directory layout

```
src/
  app/
    (marketing)              public routes
      page.tsx                   landing page
      sign-in/                   demo persona picker
    (app)/                   authenticated app shell
      layout.tsx                 global auth guard
      admin/                     super admin
      org/[orgSlug]/             org admin
        w/[wsSlug]/              workspace admin
      manager/                   people manager
      learner/                   learner
    actions/session.ts           sign in / impersonate / sign out
  components/
    ui/                          design system (Button, Card, Badge, Avatar, Progress, Tabs, Dialog, Tooltip, Switch, ScrollArea, EmptyState, etc.)
    shell/                       AppShell, Sidebar, Topbar, PageHeader, KpiCard
    path/journey-map.tsx         ★ Flagship interactive SVG journey map
    charts/                      MiniTrend, ComplianceBar (Recharts)
    brand/logo.tsx               Northstar mark
    theme-provider.tsx           light/dark theme
  lib/
    types.ts                     full domain model
    data.ts                      seed data — 3 orgs, 9 workspaces, 13 courses, 3 paths, real assignments, certs, AI suggestions
    journey.ts                   derives per-node status (completed, overdue, expiring, locked, available, in_progress)
    auth.ts                      session helpers (cookie-based demo auth)
    utils.ts                     cn(), formatDate, relativeDate, initials, pickColor
db/
  schema.sql                     full Postgres schema with enums, FKs, indexes, RLS enabled
  policies.sql                   RLS policies implementing the tenant model
```

### Hierarchy & role model

Northstar enforces the waterfall from the spec:

```
┌─────────────────────────────────────────────────────┐
│ PLATFORM                                            │
│  └── super_admin (vendor side)                      │
│      impersonates ▾  monitors ▾  bills ▾            │
├─────────────────────────────────────────────────────┤
│ ORGANIZATION (tenant)                               │
│  ├── org_admin                                      │
│  │   owns org-wide paths, branding, feeds, reports  │
│  └── WORKSPACE (isolated mini-LMS)                  │
│       ├── workspace_admin                           │
│       ├── workspace_author / SME                    │
│       ├── workspace_viewer / auditor                │
│       └── referenced by                             │
│           ├── manager (auto-provisioned from feed)  │
│           └── learner                               │
└─────────────────────────────────────────────────────┘
```

Routes mirror that model: `/admin`, `/org/<slug>`, `/org/<slug>/w/<ws>`, `/manager`, `/learner`. Each has its own sidebar, its own scope label, and its own data.

---

## What's fully built (working end-to-end)

- ✅ **Landing page** with hero journey art and feature overview
- ✅ **Demo sign-in / persona picker** with role-based redirect
- ✅ **Role-based app shell** — different sidebar and scope per role
- ✅ **Dark / light theme** with localStorage persistence
- ✅ **Super Admin dashboard** — platform KPIs, completion trend, org tiles, flags, AI queue counts, feed sync status
- ✅ **Organizations index & tenant overview**
- ✅ **Organization Admin dashboard** — workspace tiles, compliance trend, AI queue, org paths
- ✅ **Organizational learning paths** — list, detail with visual journey map, reference tracking, new-path flow
- ✅ **Org catalog, people directory, reports, compliance, audit, settings**
- ✅ **Workspace Admin dashboard** — top courses, AI queue, workspace paths, survey triggers, KPIs
- ✅ **Workspace course library** — thumbnails, type/category badges, draft state, shared-to-org marker
- ✅ **Workspace course detail** — hero banner, 4-tab surface (Structure, Assignment, AI context, Learners, Notifications), action bar
- ✅ **Course builder UI** — 3-panel editor (structure tree, canvas, settings drawer), real module/question rendering from seed data
- ✅ **Workspace learning paths** — list, detail with journey map, edit view
- ✅ **Learning path builder UI** — node palette, canvas with live map, settings drawer
- ✅ **Surveys / needs assessments** — questions with triggered courses visible
- ✅ **Assignment center** — 8 assignment methods laid out, recent batches
- ✅ **Smart groups** — rule-based audience builder
- ✅ **AI review queue** — pending suggestions with confidence, reason, evidence, approve/reject
- ✅ **Notifications** — 3-level template system (platform / org / workspace overrides)
- ✅ **Workspace reports** — trend chart, per-course compliance stacked bar
- ✅ **Manager dashboard** — team roster, overall compliance, expiring credentials, deadlines with nudges
- ✅ **Manager → direct reports → learner drill-in** with full assignment + credential history
- ✅ **Manager compliance page** — per-course completion rates across team
- ✅ **★ Learner dashboard with flagship Visual Journey Map** — SVG constellation with:
  - Per-node status (completed, in-progress, available, overdue, expiring, locked)
  - Alternate/branch edges (survey → conditional downstream)
  - Hover + click popovers with status chip, expiration info, start/continue/review actions
  - Completed nodes glow; overdue nodes flag; credential node has a gold outline
- ✅ **Learner training list** — overdue / due / completed tabs with source attribution
- ✅ **Learner course viewer** — type-specific UI (authored, live session, policy attestation), progress sidebar, "assigned because" reason
- ✅ **Learner certificates** — active / expiring / expired grouping, credential codes, expiration dates
- ✅ **Optional development** page (bookmark UX, course cards)
- ✅ **Impersonation** — super admin can step into any user and exit back (real cookie round-trip, audit-ready)
- ✅ **Audit log** — platform + org scopes
- ✅ **Billing / usage** — per-tenant subscription view
- ✅ **Postgres/Supabase schema + RLS policies** — complete, ready to apply

## What's scaffolded (structure present, implementation landing in phases 4–5 per spec)

- ⚙ **Live database persistence** — currently an in-memory seed module. The data-access functions are structured to swap for a Supabase client without touching page code.
- ⚙ **Real authentication** — demo uses a signed cookie with an in-memory user. `src/lib/auth.ts` is the single swap-point for NextAuth or Supabase Auth (magic link, SSO, MFA).
- ⚙ **Drag-and-drop reordering** in the course and path builders. The editor layouts are laid out with a structure sidebar, canvas, and settings drawer; wiring in `dnd-kit` is a phase-2 task.
- ⚙ **SCORM / AICC runtime** — upload and launch flows are represented as course types; actual xAPI/SCORM 2004 tracking requires a dedicated runtime wrapper (e.g. `scorm-again`).
- ⚙ **Real background jobs** — AI grooming, due-soon reminders, renewal scheduling are represented in UI; pair with Supabase Edge Functions + pg-cron or Inngest.
- ⚙ **Email delivery** — notification templates and the manual sender UI are in place; wire Resend / Postmark / SES.
- ⚙ **Shared dashboard links** — metadata is stored; actual public rendering is scaffolded.
- ⚙ **Bookmarks & personal path composer** for learners — UI present; persistence pending.

Anything labeled **scaffolded** in the UI says so explicitly in empty states or descriptions — there are no silent dead-ends.

---

## Design philosophy

- **Northstar metaphor** runs through the visual identity: constellation backgrounds, aurora gradients, the star-field hero, node-based paths, gold credential halos.
- **Premium, not bland.** The learner dashboard is deliberately more engaging than a compliance LMS; the admin views are clean without being sterile.
- **Role-appropriate density.** Admin views can tolerate dense tables and multi-panel editors; the learner view stays visual and light.
- **Accessible by default.** Radix primitives give keyboard/focus/screen-reader behavior; Tailwind tokens cover contrast both modes.
- **Responsive.** All pages are responsive down to ~375px.

---

## Data model (summary)

See `db/schema.sql` for the full definitive schema. Highlights:

- `organizations` ⟶ `workspaces` ⟶ (`courses`, `learning_paths`, `surveys`, `smart_groups`, `ai_suggestions`, `notification_templates`)
- `users` carry `user_roles` rows (role + scope + optional workspace_id), plus an `employee_profiles` row populated from the feed
- `learning_paths` have `path_nodes` and `path_edges` — edges support prerequisites and alternate branches
- `assignments` support every method from the spec (manual, CSV, group, smart_rule, survey, AI, self, org_path, path_node)
- `certificates` with expiration, renewal cycles, and status (active/expiring/expired)
- `audit_log` and `impersonation_sessions` for compliance
- RLS policies in `db/policies.sql` enforce tenant isolation at the database level

---

## Running locally

```bash
npm install        # install deps
npm run dev        # start on :3000
npm run build      # production build
npm run typecheck  # TypeScript
npm run lint       # ESLint
```

No environment variables are required for the demo. When moving to Supabase, add:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server actions only
```

Then apply `db/schema.sql` + `db/policies.sql` in the Supabase SQL editor.

---

## Credits & roadmap

Built as a faithful implementation of the Northstar LXP product spec, phases 1–3 shipped here, phases 4–5 scaffolded.

### Next steps (phases 4–5 per spec)

1. Swap in Supabase for the data layer (replace `src/lib/data.ts` exports with typed query functions).
2. Wire NextAuth (or Supabase Auth) in `src/lib/auth.ts` — everything else already uses `getSession()`.
3. Add drag-and-drop to the course and path builders.
4. Ship the grooming job framework (pg-cron or Inngest) for due-soon reminders, renewal scheduling, and AI suggestion batches.
5. Wire email delivery and the manual notification sender.
6. Add the SCORM/AICC runtime wrapper.
7. Ship the shared public dashboard renderer with password protection.

---

<sub>© Northstar LXP · A demo build illustrating real SaaS architecture.</sub>
