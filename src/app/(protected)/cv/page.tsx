import Link from "next/link";
import { headers } from "next/headers";
import { getMasterCv } from "@/lib/data/cv";
import { CvEditor } from "@/components/cv/CvEditor";
import { DotGridBackground } from "@/components/puzzle/DotGridBackground";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";

export default async function CvPage() {
  // Set by the proxy after it already validated the session for this
  // request — avoids a second auth.getUser() network round trip here.
  const userId = (await headers()).get("x-user-id")!;
  const cv = await getMasterCv(userId);

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
