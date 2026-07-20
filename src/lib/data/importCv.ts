import { createClient } from "@/lib/supabase/server";
import { nextSortOrder } from "@/lib/data/crud";
import type { ParsedResume } from "@/lib/gemini/importSchema";

export type ImportSummary = {
  education: number;
  experience: number;
  projects: number;
  skills: number;
  links: number;
};

/**
 * Writes parsed LinkedIn/resume PDF data into the master CV. Existing rows
 * are never touched: profile fields are only filled in where currently
 * empty, and every education/experience/project/skill/link entry is
 * appended as a brand-new row. Import is additive and reversible — any
 * unwanted or duplicate entries can be removed with the normal CV editor.
 */
export async function importParsedResume(
  userId: string,
  parsed: ParsedResume
): Promise<ImportSummary> {
  const supabase = await createClient();

  const { data: existingProfile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("full_name, headline, summary, location, phone, website_url")
    .eq("id", userId)
    .single();
  if (profileFetchError) throw profileFetchError;

  const profileUpdate: Record<string, string> = {};
  if (!existingProfile?.full_name && parsed.profile.fullName) {
    profileUpdate.full_name = parsed.profile.fullName;
  }
  if (!existingProfile?.headline && parsed.profile.headline) {
    profileUpdate.headline = parsed.profile.headline;
  }
  if (!existingProfile?.summary && parsed.profile.summary) {
    profileUpdate.summary = parsed.profile.summary;
  }
  if (!existingProfile?.location && parsed.profile.location) {
    profileUpdate.location = parsed.profile.location;
  }
  if (!existingProfile?.phone && parsed.profile.phone) {
    profileUpdate.phone = parsed.profile.phone;
  }
  if (!existingProfile?.website_url && parsed.profile.websiteUrl) {
    profileUpdate.website_url = parsed.profile.websiteUrl;
  }
  if (Object.keys(profileUpdate).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId);
    if (error) throw error;
  }

  let educationSort = await nextSortOrder("education", userId, "user_id", userId);
  for (const edu of parsed.education) {
    const { data, error } = await supabase
      .from("education")
      .insert({
        user_id: userId,
        institution: edu.institution,
        degree: edu.degree,
        field_of_study: edu.fieldOfStudy,
        start_date: edu.startDate,
        end_date: edu.endDate,
        gpa: edu.gpa,
        sort_order: educationSort++,
      })
      .select("id")
      .single();
    if (error) throw error;
    if (edu.bullets.length > 0) {
      const { error: bulletError } = await supabase.from("education_bullets").insert(
        edu.bullets.map((content, i) => ({
          education_id: data.id,
          user_id: userId,
          content,
          sort_order: i,
        }))
      );
      if (bulletError) throw bulletError;
    }
  }

  let experienceSort = await nextSortOrder("experience", userId, "user_id", userId);
  for (const exp of parsed.experience) {
    const { data, error } = await supabase
      .from("experience")
      .insert({
        user_id: userId,
        company: exp.company,
        role_title: exp.roleTitle,
        location: exp.location,
        start_date: exp.startDate,
        end_date: exp.endDate,
        is_current: exp.isCurrent,
        sort_order: experienceSort++,
      })
      .select("id")
      .single();
    if (error) throw error;
    if (exp.bullets.length > 0) {
      const { error: bulletError } = await supabase.from("experience_bullets").insert(
        exp.bullets.map((content, i) => ({
          experience_id: data.id,
          user_id: userId,
          content,
          sort_order: i,
        }))
      );
      if (bulletError) throw bulletError;
    }
  }

  let projectSort = await nextSortOrder("projects", userId, "user_id", userId);
  for (const proj of parsed.projects) {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: proj.name,
        description: proj.description,
        url: proj.url,
        tech_stack: proj.techStack,
        start_date: proj.startDate,
        end_date: proj.endDate,
        sort_order: projectSort++,
      })
      .select("id")
      .single();
    if (error) throw error;
    if (proj.bullets.length > 0) {
      const { error: bulletError } = await supabase.from("project_bullets").insert(
        proj.bullets.map((content, i) => ({
          project_id: data.id,
          user_id: userId,
          content,
          sort_order: i,
        }))
      );
      if (bulletError) throw bulletError;
    }
  }

  if (parsed.skills.length > 0) {
    let skillSort = await nextSortOrder("skills", userId, "user_id", userId);
    const { error } = await supabase.from("skills").insert(
      parsed.skills.map((s) => ({
        user_id: userId,
        category: s.category || "General",
        name: s.name,
        sort_order: skillSort++,
      }))
    );
    if (error) throw error;
  }

  if (parsed.links.length > 0) {
    let linkSort = await nextSortOrder("links", userId, "user_id", userId);
    const { error } = await supabase.from("links").insert(
      parsed.links.map((l) => ({
        user_id: userId,
        label: l.label,
        url: l.url,
        sort_order: linkSort++,
      }))
    );
    if (error) throw error;
  }

  return {
    education: parsed.education.length,
    experience: parsed.experience.length,
    projects: parsed.projects.length,
    skills: parsed.skills.length,
    links: parsed.links.length,
  };
}
