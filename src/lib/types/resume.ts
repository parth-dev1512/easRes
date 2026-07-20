import type { GeneratedContent } from "@/lib/gemini/schema";
import type { MasterCv } from "@/lib/types/cv";

export type SavedResume = {
  id: string;
  title: string | null;
  job_title: string | null;
  company_name: string | null;
  job_description: string;
  ai_model: string | null;
  generated_content: GeneratedContent;
  toggle_state: ToggleState;
  status: "draft" | "final";
  created_at: string;
  updated_at: string;
};

export type ToggleState = {
  sections: {
    summary: boolean;
    experience: boolean;
    projects: boolean;
    education: boolean;
    skills: boolean;
    links: boolean;
  };
  experience: Record<string, { included: boolean; bullets: Record<string, boolean> }>;
  projects: Record<string, { included: boolean; bullets: Record<string, boolean> }>;
  education: Record<string, boolean>;
  skills: Record<string, boolean>;
  links: Record<string, boolean>;
};

/** Stable key for a tailored bullet: its source bullet id, or a positional
 * fallback if the model ever returns a bullet with no single source. */
export function bulletKey(sourceBulletId: string | null, index: number): string {
  return sourceBulletId ?? `idx-${index}`;
}

const ENTRY_RELEVANCE_THRESHOLD = 40;

export function computeDefaultToggleState(
  content: GeneratedContent,
  cv: MasterCv
): ToggleState {
  return {
    sections: {
      summary: true,
      experience: true,
      projects: true,
      education: true,
      skills: true,
      links: true,
    },
    experience: Object.fromEntries(
      content.experience.map((e) => [
        e.sourceId,
        {
          included: e.relevanceScore >= ENTRY_RELEVANCE_THRESHOLD,
          bullets: Object.fromEntries(
            e.bullets.map((b, i) => [bulletKey(b.sourceBulletId, i), true])
          ),
        },
      ])
    ),
    projects: Object.fromEntries(
      content.projects.map((p) => [
        p.sourceId,
        {
          included: p.relevanceScore >= ENTRY_RELEVANCE_THRESHOLD,
          bullets: Object.fromEntries(
            p.bullets.map((b, i) => [bulletKey(b.sourceBulletId, i), true])
          ),
        },
      ])
    ),
    education: Object.fromEntries(
      content.education.map((e) => [e.sourceId, e.include])
    ),
    skills: Object.fromEntries(cv.skills.map((s) => [s.id, true])),
    links: Object.fromEntries(cv.links.map((l) => [l.id, true])),
  };
}
