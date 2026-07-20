"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  requireUserId,
  insertOwnedRow,
  updateOwnedRow,
  deleteOwnedRow,
  moveOwnedRow,
  nextSortOrder,
} from "@/lib/data/crud";
import {
  ProfileSchema,
  EducationSchema,
  ExperienceSchema,
  ProjectSchema,
  SkillSchema,
  LinkSchema,
} from "@/lib/types/cv";

function bulletContentsFrom(formData: FormData): string[] {
  return formData
    .getAll("bullet_content")
    .map((v) => String(v).trim())
    .filter(Boolean);
}

async function replaceBullets(
  table: "education_bullets" | "experience_bullets" | "project_bullets",
  parentColumn: "education_id" | "experience_id" | "project_id",
  parentId: string,
  userId: string,
  contents: string[]
) {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq(parentColumn, parentId)
    .eq("user_id", userId);
  if (deleteError) throw deleteError;

  if (contents.length === 0) return;

  const { error: insertError } = await supabase.from(table).insert(
    contents.map((content, i) => ({
      [parentColumn]: parentId,
      user_id: userId,
      content,
      sort_order: i,
    }))
  );
  if (insertError) throw insertError;
}

// ---------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------
export async function updateProfile(formData: FormData) {
  const userId = await requireUserId();
  const fields = ProfileSchema.parse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    location: formData.get("location"),
    headline: formData.get("headline"),
    summary: formData.get("summary"),
    website_url: formData.get("website_url"),
  });
  // profiles.id *is* the user id (1:1 with auth.users) — no separate
  // user_id column, so it can't go through the generic owned-row helper.
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(fields).eq("id", userId);
  if (error) throw error;
  revalidatePath("/cv");
}

// ---------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------
export async function createEducationEntry() {
  const userId = await requireUserId();
  const sortOrder = await nextSortOrder("education", userId, "user_id", userId);
  await insertOwnedRow("education", userId, { sort_order: sortOrder });
  revalidatePath("/cv");
}

export async function saveEducationEntry(entryId: string, formData: FormData) {
  const userId = await requireUserId();
  const fields = EducationSchema.parse({
    institution: formData.get("institution"),
    degree: formData.get("degree"),
    field_of_study: formData.get("field_of_study"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    gpa: formData.get("gpa"),
  });
  await updateOwnedRow("education", userId, entryId, fields);
  await replaceBullets(
    "education_bullets",
    "education_id",
    entryId,
    userId,
    bulletContentsFrom(formData)
  );
  revalidatePath("/cv");
}

export async function deleteEducationEntry(entryId: string) {
  const userId = await requireUserId();
  await deleteOwnedRow("education", userId, entryId);
  revalidatePath("/cv");
}

export async function moveEducationEntry(entryId: string, direction: "up" | "down") {
  const userId = await requireUserId();
  await moveOwnedRow("education", userId, "user_id", userId, entryId, direction);
  revalidatePath("/cv");
}

// ---------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------
export async function createExperienceEntry() {
  const userId = await requireUserId();
  const sortOrder = await nextSortOrder("experience", userId, "user_id", userId);
  await insertOwnedRow("experience", userId, { sort_order: sortOrder });
  revalidatePath("/cv");
}

export async function saveExperienceEntry(entryId: string, formData: FormData) {
  const userId = await requireUserId();
  const fields = ExperienceSchema.parse({
    company: formData.get("company"),
    role_title: formData.get("role_title"),
    location: formData.get("location"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    is_current: formData.get("is_current") === "on",
  });
  await updateOwnedRow("experience", userId, entryId, fields);
  await replaceBullets(
    "experience_bullets",
    "experience_id",
    entryId,
    userId,
    bulletContentsFrom(formData)
  );
  revalidatePath("/cv");
}

export async function deleteExperienceEntry(entryId: string) {
  const userId = await requireUserId();
  await deleteOwnedRow("experience", userId, entryId);
  revalidatePath("/cv");
}

export async function moveExperienceEntry(entryId: string, direction: "up" | "down") {
  const userId = await requireUserId();
  await moveOwnedRow("experience", userId, "user_id", userId, entryId, direction);
  revalidatePath("/cv");
}

// ---------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------
export async function createProjectEntry() {
  const userId = await requireUserId();
  const sortOrder = await nextSortOrder("projects", userId, "user_id", userId);
  await insertOwnedRow("projects", userId, { sort_order: sortOrder });
  revalidatePath("/cv");
}

export async function saveProjectEntry(entryId: string, formData: FormData) {
  const userId = await requireUserId();
  const parsed = ProjectSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    url: formData.get("url"),
    tech_stack: formData.get("tech_stack"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });
  const { tech_stack, ...rest } = parsed;
  const techStackArray = tech_stack
    ? tech_stack.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  await updateOwnedRow("projects", userId, entryId, {
    ...rest,
    tech_stack: techStackArray,
  });
  await replaceBullets(
    "project_bullets",
    "project_id",
    entryId,
    userId,
    bulletContentsFrom(formData)
  );
  revalidatePath("/cv");
}

export async function deleteProjectEntry(entryId: string) {
  const userId = await requireUserId();
  await deleteOwnedRow("projects", userId, entryId);
  revalidatePath("/cv");
}

export async function moveProjectEntry(entryId: string, direction: "up" | "down") {
  const userId = await requireUserId();
  await moveOwnedRow("projects", userId, "user_id", userId, entryId, direction);
  revalidatePath("/cv");
}

// ---------------------------------------------------------------------
// Skills (flat, single-line)
// ---------------------------------------------------------------------
export async function createSkill(formData: FormData) {
  const userId = await requireUserId();
  const fields = SkillSchema.parse({
    category: formData.get("category") || "General",
    name: formData.get("name"),
  });
  const sortOrder = await nextSortOrder("skills", userId, "user_id", userId);
  await insertOwnedRow("skills", userId, { ...fields, sort_order: sortOrder });
  revalidatePath("/cv");
}

export async function deleteSkill(skillId: string) {
  const userId = await requireUserId();
  await deleteOwnedRow("skills", userId, skillId);
  revalidatePath("/cv");
}

// ---------------------------------------------------------------------
// Links (flat, single-line)
// ---------------------------------------------------------------------
export async function createLink(formData: FormData) {
  const userId = await requireUserId();
  const fields = LinkSchema.parse({
    label: formData.get("label"),
    url: formData.get("url"),
  });
  const sortOrder = await nextSortOrder("links", userId, "user_id", userId);
  await insertOwnedRow("links", userId, { ...fields, sort_order: sortOrder });
  revalidatePath("/cv");
}

export async function deleteLink(linkId: string) {
  const userId = await requireUserId();
  await deleteOwnedRow("links", userId, linkId);
  revalidatePath("/cv");
}
