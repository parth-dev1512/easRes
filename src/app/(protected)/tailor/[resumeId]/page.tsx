import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMasterCv } from "@/lib/data/cv";
import { getSavedResume } from "@/lib/data/resumes";
import { TailorWorkspace } from "@/components/resume/TailorWorkspace";
import { DotGridBackground } from "@/components/puzzle/DotGridBackground";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";

export default async function SavedTailorPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { resumeId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [cv, resume] = await Promise.all([
    getMasterCv(user!.id),
    getSavedResume(user!.id, resumeId),
  ]);

  if (!resume) notFound();

  return (
    <DotGridBackground className="flex-1">
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 bg-board border-b-4 border-black">
        <PuzzleCard className="bg-white px-6 py-2">
          <h1 className="text-2xl font-[900] tracking-tighter uppercase italic">
            {resume.title || "Tailored Resume"}
          </h1>
        </PuzzleCard>
        <div className="flex items-center gap-4">
          <Link
            href={`/tailor/${resume.id}/print`}
            target="_blank"
            className="text-sm font-bold uppercase underline"
          >
            Print / Export
          </Link>
          <Link href="/resumes" className="text-sm font-bold uppercase underline">
            Back to Saved Resumes
          </Link>
        </div>
      </header>
      <TailorWorkspace
        cv={cv}
        resumeId={resume.id}
        initialJobDescription={resume.job_description}
        initialTitle={resume.title ?? ""}
        initialCompanyName={resume.company_name ?? ""}
        initialGeneratedContent={resume.generated_content}
        initialToggleState={resume.toggle_state}
      />
    </DotGridBackground>
  );
}
