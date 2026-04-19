-- ============================================================================
-- Northstar LXP — Postgres / Supabase schema
--
-- This schema mirrors the TypeScript types in src/lib/types.ts and the seed
-- data in src/lib/data.ts. Designed for Supabase with row-level security
-- enforcing tenant isolation across organizations and workspaces.
--
-- Apply with: `psql -f db/schema.sql` (or via Supabase SQL editor).
-- Pair with db/policies.sql for RLS.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----- enums ---------------------------------------------------------------
create type role as enum (
  'super_admin',
  'org_admin',
  'workspace_admin',
  'workspace_author',
  'workspace_viewer',
  'manager',
  'learner'
);

create type role_scope as enum ('platform', 'organization', 'workspace');
create type plan_tier as enum ('starter', 'growth', 'enterprise');
create type worker_type as enum ('full_time', 'part_time', 'contractor', 'intern');
create type employee_status as enum ('active', 'on_leave', 'terminated');

create type course_type as enum (
  'authored',
  'scorm',
  'aicc',
  'live_session',
  'policy_attestation',
  'evidence_task',
  'survey'
);

create type module_type as enum ('lesson', 'video', 'quiz', 'checkpoint', 'attestation', 'file');
create type question_type as enum ('single', 'multi', 'true_false');

create type assignment_method as enum (
  'manual', 'csv', 'group', 'smart_rule', 'survey', 'ai', 'self', 'org_path', 'path_node'
);
create type assignment_status as enum (
  'not_started', 'in_progress', 'completed', 'overdue', 'expired'
);

create type path_node_kind as enum (
  'course', 'live', 'survey', 'policy', 'checkpoint', 'credential'
);

create type survey_schedule as enum ('on_hire', 'annual', 'quarterly', 'manual');
create type notification_level as enum ('platform', 'organization', 'workspace');
create type notification_event as enum (
  'assignment', 'due_soon', 'overdue', 'expiration', 'manager_digest',
  'completion', 'path_completion', 'certificate_issued',
  'live_session_reminder', 'evidence_review'
);

create type ai_status as enum ('pending', 'approved', 'rejected');
create type cert_status as enum ('active', 'expiring', 'expired');

-- ----- core tenants --------------------------------------------------------
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  plan plan_tier not null default 'starter',
  industry text,
  logo_initials text,
  accent text,
  seats int not null default 0,
  storage_gb int not null default 0,
  storage_quota_gb int not null default 100,
  compliance_health numeric(4,3) default 0.0,
  headquarters text,
  primary_domain text,
  flags text[] default '{}',
  created_at timestamptz not null default now()
);

create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  department text,
  description text,
  emoji text,
  accent text,
  lead_user_id uuid,
  created_at timestamptz not null default now(),
  unique (org_id, slug)
);

-- ----- identity & employee feed -------------------------------------------
create table users (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete set null,
  email text unique not null,
  name text not null,
  avatar_seed text,
  manager_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role role not null,
  scope role_scope not null,
  workspace_id uuid references workspaces(id) on delete cascade,
  primary key (user_id, role, scope, coalesce(workspace_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

create table employee_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references users(id) on delete cascade,
  external_id text,
  title text,
  department text,
  division text,
  location text,
  campus text,
  hire_date date,
  worker_type worker_type,
  status employee_status default 'active',
  job_duties text[] default '{}'
);

-- ----- catalog -------------------------------------------------------------
create table courses (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  summary text,
  description text,
  type course_type not null default 'authored',
  category text,
  tags text[] default '{}',
  duration_minutes int default 0,
  thumbnail_color text,
  thumbnail_emoji text,
  required boolean default false,
  renewal_months int,
  certificate_enabled boolean default true,
  ai_context text,
  regulatory_refs text[] default '{}',
  policy_file_name text,
  policy_file_size text,
  share_to_org boolean default false,
  published boolean default false,
  created_by uuid references users(id),
  updated_at timestamptz not null default now()
);

create table course_modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  type module_type not null,
  body text,
  duration_minutes int,
  position int not null default 0
);

create table quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references course_modules(id) on delete cascade,
  prompt text not null,
  type question_type not null,
  explanation text
);

create table quiz_options (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid not null references quiz_questions(id) on delete cascade,
  label text not null,
  correct boolean default false,
  position int default 0
);

create table live_sessions (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity int,
  registered int default 0,
  location text,
  instructor text,
  virtual boolean default false,
  registration_url text
);

-- ----- learning paths ------------------------------------------------------
create table learning_paths (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade, -- null = org-wide
  name text not null,
  summary text,
  audience text,
  cover_accent text,
  certificate_on_complete boolean default true,
  required boolean default false,
  published boolean default false,
  assigned_count int default 0,
  completion_rate numeric(4,3) default 0.0,
  updated_at timestamptz not null default now()
);

create table path_nodes (
  id uuid primary key default uuid_generate_v4(),
  path_id uuid not null references learning_paths(id) on delete cascade,
  kind path_node_kind not null,
  title text not null,
  subtitle text,
  course_id uuid references courses(id) on delete set null,
  required boolean default true,
  x numeric not null default 0,
  y numeric not null default 0,
  expires_months int,
  branch_label text
);

create table path_edges (
  id uuid primary key default uuid_generate_v4(),
  path_id uuid not null references learning_paths(id) on delete cascade,
  from_node uuid not null references path_nodes(id) on delete cascade,
  to_node uuid not null references path_nodes(id) on delete cascade,
  label text,
  alternate boolean default false
);

-- ----- assignments & credentials ------------------------------------------
create table assignments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  course_id uuid references courses(id) on delete set null,
  path_id uuid references learning_paths(id) on delete set null,
  method assignment_method not null,
  source text,
  status assignment_status not null default 'not_started',
  progress numeric(4,3) default 0.0,
  due_at timestamptz,
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz,
  score numeric(4,3)
);

create table certificates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  course_id uuid references courses(id) on delete set null,
  path_id uuid references learning_paths(id) on delete set null,
  credential_code text unique not null,
  pdf_template text default 'default',
  status cert_status not null default 'active',
  issued_at timestamptz not null default now(),
  expires_at timestamptz
);

-- ----- targeting & automation ---------------------------------------------
create table smart_groups (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  description text,
  conditions jsonb not null,
  member_count int default 0,
  created_at timestamptz not null default now()
);

create table surveys (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text,
  schedule survey_schedule default 'manual',
  published boolean default false,
  created_at timestamptz not null default now()
);

create table survey_questions (
  id uuid primary key default uuid_generate_v4(),
  survey_id uuid not null references surveys(id) on delete cascade,
  prompt text not null,
  type question_type not null,
  position int default 0
);

create table survey_options (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid not null references survey_questions(id) on delete cascade,
  label text not null,
  triggers_course_id uuid references courses(id) on delete set null,
  triggers_path_id uuid references learning_paths(id) on delete set null,
  position int default 0
);

-- ----- AI ------------------------------------------------------------------
create table ai_suggestions (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  course_id uuid references courses(id) on delete set null,
  path_id uuid references learning_paths(id) on delete set null,
  user_id uuid not null references users(id) on delete cascade,
  reason text,
  confidence numeric(4,3) default 0.0,
  evidence text[] default '{}',
  status ai_status default 'pending',
  created_at timestamptz not null default now()
);

-- ----- notifications -------------------------------------------------------
create table notification_templates (
  id uuid primary key default uuid_generate_v4(),
  level notification_level not null,
  org_id uuid references organizations(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,
  event notification_event not null,
  subject text not null,
  body text not null,
  enabled boolean default true,
  updated_at timestamptz default now()
);

-- ----- sharing, audit, impersonation --------------------------------------
create table dashboard_shares (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,
  title text not null,
  url text not null,
  password_protected boolean default false,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete set null,
  workspace_id uuid references workspaces(id) on delete set null,
  actor_id uuid references users(id) on delete set null,
  action text not null,
  target text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table impersonation_sessions (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid not null references users(id) on delete cascade,
  target_user_id uuid not null references users(id) on delete cascade,
  reason text,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

-- ----- indexes -------------------------------------------------------------
create index on workspaces (org_id);
create index on users (org_id);
create index on courses (workspace_id);
create index on learning_paths (org_id);
create index on path_nodes (path_id);
create index on path_edges (path_id);
create index on assignments (user_id);
create index on assignments (course_id);
create index on assignments (path_id);
create index on ai_suggestions (workspace_id, status);
create index on certificates (user_id);
create index on employee_profiles (department);
create index on audit_log (org_id, created_at desc);

-- ----- enable row-level security -----------------------------------------
alter table organizations enable row level security;
alter table workspaces enable row level security;
alter table users enable row level security;
alter table user_roles enable row level security;
alter table employee_profiles enable row level security;
alter table courses enable row level security;
alter table course_modules enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_options enable row level security;
alter table live_sessions enable row level security;
alter table learning_paths enable row level security;
alter table path_nodes enable row level security;
alter table path_edges enable row level security;
alter table assignments enable row level security;
alter table certificates enable row level security;
alter table smart_groups enable row level security;
alter table surveys enable row level security;
alter table survey_questions enable row level security;
alter table survey_options enable row level security;
alter table ai_suggestions enable row level security;
alter table notification_templates enable row level security;
alter table dashboard_shares enable row level security;
alter table audit_log enable row level security;
alter table impersonation_sessions enable row level security;

-- RLS policies live in db/policies.sql.
