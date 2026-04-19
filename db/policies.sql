-- ============================================================================
-- Northstar LXP — Row-Level Security policies (Supabase)
--
-- Tenant isolation rules enforced at the database level. These match the
-- permission model in src/lib/auth.ts and src/lib/types.ts.
--
-- auth.uid() is the Supabase session helper. The is_super_admin, org_admin
-- and workspace scope checks use the user_roles table.
-- ============================================================================

-- Helpers --------------------------------------------------------------------
create or replace function auth_user_id() returns uuid language sql stable as
$$ select auth.uid() $$;

create or replace function is_super_admin() returns boolean language sql stable as
$$ select exists (
  select 1 from user_roles
  where user_id = auth_user_id() and role = 'super_admin' and scope = 'platform'
) $$;

create or replace function is_org_member(o uuid) returns boolean language sql stable as
$$ select exists (
  select 1 from users u where u.id = auth_user_id() and u.org_id = o
) $$;

create or replace function is_org_admin(o uuid) returns boolean language sql stable as
$$ select exists (
  select 1 from user_roles r
  join users u on u.id = r.user_id
  where r.user_id = auth_user_id() and r.role = 'org_admin' and r.scope = 'organization'
    and u.org_id = o
) $$;

create or replace function is_workspace_member(w uuid) returns boolean language sql stable as
$$ select exists (
  select 1 from user_roles r
  where r.user_id = auth_user_id()
    and r.scope = 'workspace' and r.workspace_id = w
    and r.role in ('workspace_admin', 'workspace_author', 'workspace_viewer')
) $$;

-- Organizations --------------------------------------------------------------
create policy "super admins read all orgs"
  on organizations for select
  using (is_super_admin());

create policy "org members read their org"
  on organizations for select
  using (is_org_member(id));

create policy "org admins update their org"
  on organizations for update
  using (is_org_admin(id));

create policy "super admins manage orgs"
  on organizations for all
  using (is_super_admin())
  with check (is_super_admin());

-- Workspaces -----------------------------------------------------------------
create policy "members read their org's workspaces"
  on workspaces for select
  using (is_super_admin() or is_org_member(org_id));

create policy "org admins manage workspaces"
  on workspaces for all
  using (is_super_admin() or is_org_admin(org_id))
  with check (is_super_admin() or is_org_admin(org_id));

-- Users / memberships --------------------------------------------------------
create policy "users read themselves or org peers"
  on users for select
  using (
    id = auth_user_id()
    or is_super_admin()
    or (org_id is not null and is_org_member(org_id))
  );

create policy "org admins update users in their org"
  on users for update
  using (is_super_admin() or (org_id is not null and is_org_admin(org_id)));

create policy "roles visible to self + org admins"
  on user_roles for select
  using (
    user_id = auth_user_id()
    or is_super_admin()
    or exists (
      select 1 from users u where u.id = user_roles.user_id and is_org_admin(u.org_id)
    )
  );

-- Courses --------------------------------------------------------------------
create policy "workspace scope courses"
  on courses for select
  using (
    is_super_admin()
    or is_org_admin(org_id)
    or is_workspace_member(workspace_id)
    or exists (select 1 from users u where u.id = auth_user_id() and u.org_id = courses.org_id and courses.published)
  );

create policy "workspace admins/authors write courses"
  on courses for all
  using (
    is_super_admin()
    or is_org_admin(org_id)
    or exists (
      select 1 from user_roles r
      where r.user_id = auth_user_id()
        and r.scope = 'workspace' and r.workspace_id = courses.workspace_id
        and r.role in ('workspace_admin', 'workspace_author')
    )
  )
  with check (
    is_super_admin()
    or is_org_admin(org_id)
    or exists (
      select 1 from user_roles r
      where r.user_id = auth_user_id()
        and r.scope = 'workspace' and r.workspace_id = courses.workspace_id
        and r.role in ('workspace_admin', 'workspace_author')
    )
  );

-- Child tables inherit org scope via parent course --------------------------
create policy "course children follow course scope"
  on course_modules for select
  using (exists (select 1 from courses c where c.id = course_id
                 and (is_super_admin() or is_org_admin(c.org_id) or is_workspace_member(c.workspace_id))));

-- Learning paths -------------------------------------------------------------
create policy "paths visible within org"
  on learning_paths for select
  using (
    is_super_admin()
    or is_org_admin(org_id)
    or (workspace_id is not null and is_workspace_member(workspace_id))
    or exists (select 1 from users u where u.id = auth_user_id() and u.org_id = learning_paths.org_id and learning_paths.published)
  );

create policy "path write by admins"
  on learning_paths for all
  using (
    is_super_admin()
    or is_org_admin(org_id)
    or (workspace_id is not null and exists (
      select 1 from user_roles r
      where r.user_id = auth_user_id()
        and r.scope = 'workspace' and r.workspace_id = learning_paths.workspace_id
        and r.role = 'workspace_admin'
    ))
  )
  with check (true);

-- Assignments ----------------------------------------------------------------
create policy "learner reads own; manager reads team; admins read org"
  on assignments for select
  using (
    user_id = auth_user_id()
    or is_super_admin()
    or exists (
      select 1 from users u
      where u.id = assignments.user_id
        and (is_org_admin(u.org_id)
          or u.manager_id = auth_user_id()
          or exists (
            select 1 from user_roles r, courses c
            where r.user_id = auth_user_id()
              and r.scope = 'workspace'
              and (assignments.course_id = c.id and r.workspace_id = c.workspace_id)
          )
        )
    )
  );

create policy "assignment writes by admins and automation"
  on assignments for all
  using (
    is_super_admin()
    or exists (
      select 1 from users u
      where u.id = assignments.user_id
        and (
          is_org_admin(u.org_id)
          or exists (
            select 1 from user_roles r
            where r.user_id = auth_user_id() and r.scope = 'workspace'
          )
        )
    )
  )
  with check (true);

-- Certificates ---------------------------------------------------------------
create policy "certs visible to owner + managers + org admins"
  on certificates for select
  using (
    user_id = auth_user_id()
    or is_super_admin()
    or exists (
      select 1 from users u
      where u.id = certificates.user_id
        and (is_org_admin(u.org_id) or u.manager_id = auth_user_id())
    )
  );

-- Audit log ------------------------------------------------------------------
create policy "audit visible to super + org admins"
  on audit_log for select
  using (
    is_super_admin()
    or (org_id is not null and is_org_admin(org_id))
  );

create policy "audit writes from application only"
  on audit_log for insert
  with check (true);
