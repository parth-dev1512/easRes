import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMasterCv } from "@/lib/data/cv";
import { getSavedResume } from "@/lib/data/resumes";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { PrintButton } from "@/components/resume/PrintButton";

export default async function PrintResumePage({
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
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="print:hidden sticky top-0 z-10 flex justify-end p-4">
        <PrintButton />
      </div>
      <div className="max-w-[8.5in] mx-auto bg-white p-10 shadow-lg print:p-0 print:max-w-none print:shadow-none">
        <ResumePreview
          cv={cv}
          content={resume.generated_content}
          toggleState={resume.toggle_state}
        />
      </div>
    </div>
  );
}
