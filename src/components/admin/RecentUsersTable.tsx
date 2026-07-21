import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import type { RecentSignup } from "@/lib/admin/users";

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}

export function RecentUsersTable({ users }: { users: RecentSignup[] }) {
  return (
    <PuzzleCard className="bg-white text-black p-6 flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
        Recent signups
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-bold uppercase tracking-widest text-slate-500 border-b-2 border-black">
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Signed up</th>
              <th className="py-2 pr-4">Last active</th>
              <th className="py-2 pr-4 text-right">Resumes</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-200">
                <td className="py-2 pr-4 font-medium">{user.email ?? "—"}</td>
                <td className="py-2 pr-4 text-slate-600">{user.full_name ?? "—"}</td>
                <td className="py-2 pr-4 text-slate-600">
                  {formatRelative(user.created_at)}
                </td>
                <td className="py-2 pr-4 text-slate-600">
                  {formatRelative(user.last_sign_in_at)}
                </td>
                <td className="py-2 pr-4 text-right tabular-nums">
                  {user.resume_count}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  No signups yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PuzzleCard>
  );
}
