import { createClient } from "@/lib/supabase/server";
import type { SavedResume } from "@/lib/types/resume";

export async function listSavedResumes(userId: string): Promise<SavedResume[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tailored_resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSavedResume(
  userId: string,
  resumeId: string
): Promise<SavedResume | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tailored_resumes")
    .select("*")
    .eq("user_id", userId)
    .eq("id", resumeId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
