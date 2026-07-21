import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthUserSummary } from "./users";

export type AdminContext = {
  admin: SupabaseClient;
  users: AuthUserSummary[];
};

export type KpiResult = {
  id: string;
  label: string;
  value: string;
  helpText?: string;
};

export type KpiDefinition = {
  id: string;
  label: string;
  compute: (ctx: AdminContext) => Promise<KpiResult>;
};

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function countSince(users: AuthUserSummary[], field: keyof AuthUserSummary, since: Date): number {
  return users.filter((u) => {
    const value = u[field];
    return typeof value === "string" && new Date(value) >= since;
  }).length;
}

// To add a new KPI: write a { id, label, compute } object and push it into
// this array. `compute` gets the pre-fetched user list (cheap, no extra
// Auth API calls) plus the raw service-role `admin` client for anything
// else — new tables included, no plumbing changes needed elsewhere.
export const kpiDefinitions: KpiDefinition[] = [
  {
    id: "total-users",
    label: "Total users",
    compute: async ({ users }) => ({
      id: "total-users",
      label: "Total users",
      value: users.length.toLocaleString(),
    }),
  },
  {
    id: "new-signups-7d",
    label: "New signups (7d)",
    compute: async ({ users }) => ({
      id: "new-signups-7d",
      label: "New signups (7d)",
      value: countSince(users, "created_at", daysAgo(7)).toLocaleString(),
    }),
  },
  {
    id: "new-signups-30d",
    label: "New signups (30d)",
    compute: async ({ users }) => ({
      id: "new-signups-30d",
      label: "New signups (30d)",
      value: countSince(users, "created_at", daysAgo(30)).toLocaleString(),
    }),
  },
  {
    id: "active-users-7d",
    label: "Active users (7d)",
    compute: async ({ users }) => ({
      id: "active-users-7d",
      label: "Active users (7d)",
      value: countSince(users, "last_sign_in_at", daysAgo(7)).toLocaleString(),
      helpText: "Signed in at least once in the last 7 days",
    }),
  },
  {
    id: "resumes-total",
    label: "Resumes tailored (total)",
    compute: async ({ admin }) => {
      const { count, error } = await admin
        .from("tailored_resumes")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return {
        id: "resumes-total",
        label: "Resumes tailored (total)",
        value: (count ?? 0).toLocaleString(),
      };
    },
  },
  {
    id: "resumes-7d",
    label: "Resumes tailored (7d)",
    compute: async ({ admin }) => {
      const { count, error } = await admin
        .from("tailored_resumes")
        .select("*", { count: "exact", head: true })
        .gte("created_at", daysAgo(7).toISOString());
      if (error) throw error;
      return {
        id: "resumes-7d",
        label: "Resumes tailored (7d)",
        value: (count ?? 0).toLocaleString(),
      };
    },
  },
];
