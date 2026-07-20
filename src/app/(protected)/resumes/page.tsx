import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listSavedResumes } from "@/lib/data/resumes";
import { DotGridBackground } from "@/components/puzzle/DotGridBackground";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { DeleteResumeButton } from "@/components/resume/DeleteResumeButton";

export default async function ResumesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const resumes = await listSavedResumes(user!.id);

  return (
    <DotGridBackground className="flex-1">
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 bg-board border-b-4 border-black">
        <PuzzleCard className="bg-white px-6 py-2">
          <h1 className="text-2xl font-[900] tracking-tighter uppercase italic">
            Saved Resumes
          </h1>
        </PuzzleCard>
        <Link href="/dashboard" className="text-sm font-bold uppercase underline">
          Back to Dashboard
        </Link>
      </header>

      <div className="max-w-3xl mx-auto flex flex-col gap-4 py-12 px-4">
        <Link href="/tailor">
          <BlueprintButton type="button" variant="primary" className="w-fit px-6">
            + New Tailored Resume
          </BlueprintButton>
        </Link>

        {resumes.length === 0 && (
          <p className="text-slate-500 text-sm">
            No saved resumes yet. Tailor one from the job description page.
          </p>
        )}

        {resumes.map((resume) => (
          <PuzzleCard
            key={resume.id}
            className="bg-white p-4 flex items-center justify-between gap-4"
          >
            <Link href={`/tailor/${resume.id}`} className="flex-1 min-w-0">
              <p className="font-bold truncate">
                {resume.title || "Untitled Resume"}
              </p>
              <p className="text-sm text-slate-600 truncate">
                {resume.company_name || "No company"} &middot;{" "}
                {new Date(resume.created_at).toLocaleDateString()}
              </p>
            </Link>
            <DeleteResumeButton resumeId={resume.id} />
          </PuzzleCard>
        ))}
      </div>
    </DotGridBackground>
  );
}
