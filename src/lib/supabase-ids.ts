/**
 * Bridge between the app's demo string IDs and the deterministic UUIDs used
 * in Supabase migrations (`seed_demo_tenants_and_people`, etc.).
 *
 * The in-memory seed data in `src/lib/data.ts` uses human-readable string
 * IDs so the URL space and reads stay predictable. When we need to mirror
 * a mutation into Supabase we translate through these maps so foreign keys
 * land on the correct seeded rows.
 *
 * New records created at runtime get fresh UUIDs generated client-side by
 * `crypto.randomUUID()`; they don't need to appear here.
 */

export const orgIdToUuid: Record<string, string> = {
  org_meridian: "11111111-1111-1111-1111-000000000001",
  org_atlas: "11111111-1111-1111-1111-000000000002",
  org_northwind: "11111111-1111-1111-1111-000000000003",
};

export const workspaceIdToUuid: Record<string, string> = {
  ws_hipaa: "22222222-2222-2222-2222-000000000001",
  ws_ehs: "22222222-2222-2222-2222-000000000002",
  ws_leadership_meridian: "22222222-2222-2222-2222-000000000003",
  ws_clinical_onboarding: "22222222-2222-2222-2222-000000000004",
  ws_atlas_faculty: "22222222-2222-2222-2222-000000000005",
  ws_atlas_research: "22222222-2222-2222-2222-000000000006",
  ws_atlas_it: "22222222-2222-2222-2222-000000000007",
  ws_northwind_fleet: "22222222-2222-2222-2222-000000000008",
  ws_northwind_warehouse: "22222222-2222-2222-2222-000000000009",
};

export const userIdToUuid: Record<string, string> = {
  u_super: "33333333-3333-3333-3333-000000000001",
  u_org_admin_meridian: "33333333-3333-3333-3333-000000000002",
  u_ws_admin_ehs: "33333333-3333-3333-3333-000000000003",
  u_ws_admin_lead: "33333333-3333-3333-3333-000000000004",
  u_ws_admin_onboarding: "33333333-3333-3333-3333-000000000005",
  u_manager_meridian_icu: "33333333-3333-3333-3333-000000000006",
  u_learner_1: "33333333-3333-3333-3333-000000000007",
  u_learner_2: "33333333-3333-3333-3333-000000000008",
  u_learner_3: "33333333-3333-3333-3333-000000000009",
  u_learner_4: "33333333-3333-3333-3333-00000000000a",
  u_learner_5: "33333333-3333-3333-3333-00000000000b",
  u_org_admin_atlas: "33333333-3333-3333-3333-00000000000c",
  u_ws_admin_research: "33333333-3333-3333-3333-00000000000d",
  u_ws_admin_itsec: "33333333-3333-3333-3333-00000000000e",
  u_org_admin_northwind: "33333333-3333-3333-3333-00000000000f",
  u_ws_admin_warehouse: "33333333-3333-3333-3333-000000000010",
};

export const courseIdToUuid: Record<string, string> = {
  c_hipaa_core: "44444444-4444-4444-4444-000000000001",
  c_bbp: "44444444-4444-4444-4444-000000000002",
  c_back_safety: "44444444-4444-4444-4444-000000000003",
  c_fire_safety: "44444444-4444-4444-4444-000000000004",
  c_infection_control: "44444444-4444-4444-4444-000000000005",
  c_code_of_conduct: "44444444-4444-4444-4444-000000000006",
  c_coaching: "44444444-4444-4444-4444-000000000007",
  c_needs_assessment: "44444444-4444-4444-4444-000000000008",
  c_phishing: "44444444-4444-4444-4444-000000000009",
  c_irb: "44444444-4444-4444-4444-00000000000a",
  c_title_ix: "44444444-4444-4444-4444-00000000000b",
  c_forklift: "44444444-4444-4444-4444-00000000000c",
  c_defensive_driving: "44444444-4444-4444-4444-00000000000d",
};

export const surveyIdToUuid: Record<string, string> = {
  srv_safety_needs: "55555555-5555-5555-5555-000000000001",
};

export const pathIdToUuid: Record<string, string> = {
  lp_new_hire_clinical: "66666666-6666-6666-6666-000000000001",
  lp_leader_track: "66666666-6666-6666-6666-000000000002",
  lp_research_integrity: "66666666-6666-6666-6666-000000000003",
};

/** Returns the uuid for a demo id, or the input unchanged if it already looks like a uuid. */
export function toUuid(map: Record<string, string>, id: string | undefined | null): string | null {
  if (!id) return null;
  if (map[id]) return map[id];
  // Already a uuid (e.g. runtime-created record)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
  return null;
}
