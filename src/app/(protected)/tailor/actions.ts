"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/data/crud";
import { createClient } from "@/lib/supabase/server";
import type { GeneratedContent } from "@/lib/gemini/schema";
import type { ToggleState } from "@/lib/types/resume";

export async function saveTailoredResume(input: {
  resumeId?: string;
  jobDescription: string;
  title?: string;
  companyName?: string;
  generatedContent: GeneratedContent;
  toggleState: ToggleState;
}): Promise<{ id: string }> {
  const userId = await requireUserId();
  const supabase = await createClient();

  if (input.resumeId) {
    // generated_content is treated as immutable once saved — only the
    // mutable toggle state and title are updated on subsequent saves.
    const { error } = await supabase
      .from("tailored_resumes")
      .update({
        title: input.title ?? null,
        company_name: input.companyName ?? null,
        toggle_state: input.toggleState,
      })
      .eq("id", input.resumeId)
      .eq("user_id", userId);
    if (error) throw error;
    revalidatePath("/resumes");
    return { id: input.resumeId };
  }

  const { data, error } = await supabase
    .from("tailored_resumes")
    .insert({
      user_id: userId,
      title: input.title ?? null,
      company_name: input.companyName ?? null,
      job_description: input.jobDescription,
      ai_model: "gemini-flash-latest",
      generated_content: input.generatedContent,
      toggle_state: input.toggleState,
    })
    .select("id")
    .single();
  if (error) throw error;
  revalidatePath("/resumes");
  return { id: data.id };
}

export async function deleteResume(resumeId: string) {
  const userId = await requireUserId();
  const supabase = await createClient();
  const { error } = await supabase
    .from("tailored_resumes")
    .delete()
    .eq("id", resumeId)
    .eq("user_id", userId);
  if (error) throw error;
  revalidatePath("/resumes");
}

export async function deleteResumeAndRedirect(resumeId: string) {
  await deleteResume(resumeId);
  redirect("/resumes");
}
