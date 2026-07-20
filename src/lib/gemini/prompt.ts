import type { MasterCv } from "@/lib/types/cv";

function cvToPromptJson(cv: MasterCv) {
  return {
    headline: cv.profile.headline,
    summary: cv.profile.summary,
    experience: cv.experience.map((e) => ({
      sourceId: e.id,
      company: e.company,
      roleTitle: e.role_title,
      startDate: e.start_date,
      endDate: e.end_date,
      isCurrent: e.is_current,
      bullets: e.experience_bullets.map((b) => ({
        sourceBulletId: b.id,
        text: b.content,
      })),
    })),
    projects: cv.projects.map((p) => ({
      sourceId: p.id,
      name: p.name,
      description: p.description,
      techStack: p.tech_stack,
      bullets: p.project_bullets.map((b) => ({
        sourceBulletId: b.id,
        text: b.content,
      })),
    })),
    education: cv.education.map((e) => ({
      sourceId: e.id,
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.field_of_study,
    })),
    skills: cv.skills.map((s) => ({ category: s.category, name: s.name })),
  };
}

export function buildTailorPrompt(cv: MasterCv, jobDescription: string): string {
  const cvJson = JSON.stringify(cvToPromptJson(cv), null, 2);

  return `You are a resume tailoring assistant. Given a candidate's master CV (as JSON) and a job description, produce a tailored resume as JSON matching the required response schema exactly.

STRICT RULES — read carefully:
1. Never invent facts. Only use information present in the master CV JSON below. Do not fabricate employers, dates, metrics, or skills that aren't already there.
2. You may rewrite bullet phrasing for clarity and to better align with the job description's language and keywords, but every rewritten bullet must remain factually equivalent to its source bullet — do not invent numbers or achievements that aren't implied by the source text.
3. Every "sourceId" and "sourceBulletId" you output MUST be copied exactly from the "sourceId"/"sourceBulletId" values in the master CV JSON below. Never invent an id.
4. Include EVERY experience entry and EVERY project entry from the master CV in your output (do not silently drop any) — score each one's "relevanceScore" (0-100) based on fit with the job description instead. The caller decides what to hide; you must not omit entries.
5. For each experience/project entry, include all of its bullets (each with its own relevanceScore), rewritten for the job description where helpful. If a bullet doesn't need rewriting, return its original text unchanged with the same sourceBulletId.
6. For education, include every entry from the master CV with "include": true unless it's clearly irrelevant to this job (e.g. unrelated to the role and there are stronger entries) — but keep it true by default.
7. "summary" should be a 2-4 sentence professional summary tailored to this job description, grounded in the candidate's actual background above.
8. "headline" should be a short (<= 60 char) professional title tailored to the job, or null.
9. "skillsEmphasis" should be an ordered list of skill names (drawn from the candidate's existing skills list below, or clearly implied by their experience) that are most relevant to this job description.

MASTER CV (JSON):
${cvJson}

JOB DESCRIPTION:
"""
${jobDescription}
"""

Return only the JSON object matching the response schema. No prose, no markdown fences.`;
}
