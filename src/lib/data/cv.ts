import { createClient } from "@/lib/supabase/server";
import type { MasterCv } from "@/lib/types/cv";

export async function getMasterCv(userId: string): Promise<MasterCv> {
  const supabase = await createClient();

  const [profileRes, educationRes, experienceRes, projectsRes, skillsRes, linksRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase
        .from("education")
        .select("*, education_bullets(*)")
        .eq("user_id", userId)
        .order("sort_order")
        .order("sort_order", { referencedTable: "education_bullets" }),
      supabase
        .from("experience")
        .select("*, experience_bullets(*)")
        .eq("user_id", userId)
        .order("sort_order")
        .order("sort_order", { referencedTable: "experience_bullets" }),
      supabase
        .from("projects")
        .select("*, project_bullets(*)")
        .eq("user_id", userId)
        .order("sort_order")
        .order("sort_order", { referencedTable: "project_bullets" }),
      supabase.from("skills").select("*").eq("user_id", userId).order("sort_order"),
      supabase.from("links").select("*").eq("user_id", userId).order("sort_order"),
    ]);

  if (profileRes.error) throw profileRes.error;
  if (educationRes.error) throw educationRes.error;
  if (experienceRes.error) throw experienceRes.error;
  if (projectsRes.error) throw projectsRes.error;
  if (skillsRes.error) throw skillsRes.error;
  if (linksRes.error) throw linksRes.error;

  return {
    profile: profileRes.data,
    education: educationRes.data ?? [],
    experience: experienceRes.data ?? [],
    projects: projectsRes.data ?? [],
    skills: skillsRes.data ?? [],
    links: linksRes.data ?? [],
  };
}
