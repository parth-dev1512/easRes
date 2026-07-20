import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DotGridBackground } from "@/components/puzzle/DotGridBackground";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { logout } from "@/app/(auth)/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DotGridBackground className="flex-1 flex items-center justify-center p-6">
      <PuzzleCard className="bg-white w-full max-w-md p-8 flex flex-col gap-4">
        <h1 className="text-3xl font-[900] uppercase italic tracking-tighter">
          Dashboard
        </h1>
        <p className="text-slate-700">Signed in as {user?.email}</p>
        <Link href="/cv">
          <BlueprintButton type="button" variant="primary" className="w-full">
            Edit Master CV
          </BlueprintButton>
        </Link>
        <Link href="/tailor">
          <BlueprintButton type="button" variant="secondary" className="w-full">
            Tailor a Resume
          </BlueprintButton>
        </Link>
        <Link href="/resumes">
          <BlueprintButton type="button" variant="secondary" className="w-full">
            Saved Resumes
          </BlueprintButton>
        </Link>
        <form action={logout}>
          <BlueprintButton type="submit" variant="secondary" className="w-full">
            Log Out
          </BlueprintButton>
        </form>
      </PuzzleCard>
    </DotGridBackground>
  );
}
