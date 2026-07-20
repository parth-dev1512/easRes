import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMasterCv } from "@/lib/data/cv";
import { CvEditor } from "@/components/cv/CvEditor";
import { DotGridBackground } from "@/components/puzzle/DotGridBackground";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";

export default async function CvPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const cv = await getMasterCv(user!.id);

  return (
    <DotGridBackground className="flex-1">
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 bg-board border-b-4 border-black">
        <PuzzleCard className="bg-white px-6 py-2">
          <h1 className="text-2xl font-[900] tracking-tighter uppercase italic">
            Master CV
          </h1>
        </PuzzleCard>
        <Link
          href="/dashboard"
          className="text-sm font-bold uppercase underline"
        >
          Back to Dashboard
        </Link>
      </header>
      <CvEditor cv={cv} />
    </DotGridBackground>
  );
}
