import { createAdminClient } from "@/lib/supabase/admin";
import { listAllAuthUsers, getRecentSignups } from "@/lib/admin/users";
import { kpiDefinitions, type AdminContext } from "@/lib/admin/kpis";
import { getSignupSeries } from "@/lib/admin/signups";
import { KpiCard } from "@/components/admin/KpiCard";
import { SignupsChart } from "@/components/admin/SignupsChart";
import { RecentUsersTable } from "@/components/admin/RecentUsersTable";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();
  const users = await listAllAuthUsers(admin);
  const ctx: AdminContext = { admin, users };

  const [kpis, recentUsers] = await Promise.all([
    Promise.all(kpiDefinitions.map((kpi) => kpi.compute(ctx))),
    getRecentSignups(admin, users, 20),
  ]);

  const signupSeries = getSignupSeries(users, 30);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} {...kpi} />
        ))}
      </div>

      <SignupsChart data={signupSeries} />

      <RecentUsersTable users={recentUsers} />
    </div>
  );
}
