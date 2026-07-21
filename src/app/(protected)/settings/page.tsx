import Link from "next/link";
import { DotGridBackground } from "@/components/puzzle/DotGridBackground";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { DeleteAccountForm } from "@/components/settings/DeleteAccountForm";
import { logout } from "@/app/(auth)/actions";

export default function SettingsPage() {
  return (
    <DotGridBackground className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        <PuzzleCard className="bg-white p-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-[900] uppercase italic tracking-tighter">
              Settings
            </h1>
            <Link
              href="/dashboard"
              className="text-sm font-bold uppercase underline"
            >
              Back
            </Link>
          </div>
          <form action={logout}>
            <BlueprintButton type="submit" variant="secondary" className="w-full">
              Log Out
            </BlueprintButton>
          </form>
        </PuzzleCard>

        <PuzzleCard className="bg-white p-8 flex flex-col gap-4">
          <h2 className="text-xl font-[900] uppercase italic tracking-tighter text-puzzle-red">
            Danger Zone
          </h2>
          <p className="text-sm text-slate-600">
            Deleting your account permanently removes your master CV, saved
            resumes, and all account data. This cannot be undone.
          </p>
          <DeleteAccountForm />
        </PuzzleCard>
      </div>
    </DotGridBackground>
  );
}
