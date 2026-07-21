import type { AuthUserSummary } from "./users";

export type SignupBucket = { date: string; count: number };

export function getSignupSeries(users: AuthUserSummary[], days = 30): SignupBucket[] {
  const buckets = new Map<string, number>();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const user of users) {
    const key = user.created_at.slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}
