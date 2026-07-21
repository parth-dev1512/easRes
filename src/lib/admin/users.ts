import type { SupabaseClient } from "@supabase/supabase-js";

export type AuthUserSummary = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export type RecentSignup = AuthUserSummary & {
  full_name: string | null;
  resume_count: number;
};

const LIST_USERS_PAGE_SIZE = 1000;

export async function listAllAuthUsers(
  admin: SupabaseClient
): Promise<AuthUserSummary[]> {
  const users: AuthUserSummary[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: LIST_USERS_PAGE_SIZE,
    });
    if (error) throw error;

    users.push(
      ...data.users.map((u) => ({
        id: u.id,
        email: u.email ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
      }))
    );

    if (data.users.length < LIST_USERS_PAGE_SIZE) break;
    page += 1;
  }

  return users;
}

export async function getTailoredResumeCounts(
  admin: SupabaseClient
): Promise<Map<string, number>> {
  const { data, error } = await admin.from("tailored_resumes").select("user_id");
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }
  return counts;
}

export async function getRecentSignups(
  admin: SupabaseClient,
  users: AuthUserSummary[],
  limit: number
): Promise<RecentSignup[]> {
  const recent = [...users]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);

  if (recent.length === 0) return [];

  const ids = recent.map((u) => u.id);
  const [{ data: profiles, error: profilesError }, resumeCounts] = await Promise.all([
    admin.from("profiles").select("id, full_name").in("id", ids),
    getTailoredResumeCounts(admin),
  ]);
  if (profilesError) throw profilesError;

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name as string | null]));

  return recent.map((u) => ({
    ...u,
    full_name: nameById.get(u.id) ?? null,
    resume_count: resumeCounts.get(u.id) ?? 0,
  }));
}
