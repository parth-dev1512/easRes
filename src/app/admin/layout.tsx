import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ShieldCheck } from "lucide-react";
import { isAdminEmail } from "@/lib/admin/config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The proxy already redirected non-admins away — re-checking here is
  // defense-in-depth, same shape as (protected)/layout.tsx's x-user-id check.
  const email = (await headers()).get("x-user-email");

  if (!isAdminEmail(email)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b-4 border-black bg-black">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-3">
          <div className="bg-puzzle-yellow p-2">
            <ShieldCheck className="text-black" size={20} strokeWidth={2.5} />
          </div>
          <span className="font-[900] uppercase italic tracking-tighter text-xl">
            easRes Admin
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-white/50">
            {email}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
