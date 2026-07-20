import type { ToggleState } from "@/lib/types/resume";

export type TogglePath =
  | { kind: "section"; section: keyof ToggleState["sections"] }
  | { kind: "experienceEntry"; sourceId: string }
  | { kind: "experienceBullet"; sourceId: string; bulletKey: string }
  | { kind: "projectEntry"; sourceId: string }
  | { kind: "projectBullet"; sourceId: string; bulletKey: string }
  | { kind: "education"; sourceId: string }
  | { kind: "skill"; skillId: string }
  | { kind: "link"; linkId: string };

export function applyToggle(
  state: ToggleState,
  path: TogglePath,
  value: boolean
): ToggleState {
  switch (path.kind) {
    case "section":
      return {
        ...state,
        sections: { ...state.sections, [path.section]: value },
      };
    case "experienceEntry":
      return {
        ...state,
        experience: {
          ...state.experience,
          [path.sourceId]: {
            ...state.experience[path.sourceId],
            included: value,
          },
        },
      };
    case "experienceBullet":
      return {
        ...state,
        experience: {
          ...state.experience,
          [path.sourceId]: {
            ...state.experience[path.sourceId],
            bullets: {
              ...state.experience[path.sourceId].bullets,
              [path.bulletKey]: value,
            },
          },
        },
      };
    case "projectEntry":
      return {
        ...state,
        projects: {
          ...state.projects,
          [path.sourceId]: {
            ...state.projects[path.sourceId],
            included: value,
          },
        },
      };
    case "projectBullet":
      return {
        ...state,
        projects: {
          ...state.projects,
          [path.sourceId]: {
            ...state.projects[path.sourceId],
            bullets: {
              ...state.projects[path.sourceId].bullets,
              [path.bulletKey]: value,
            },
          },
        },
      };
    case "education":
      return {
        ...state,
        education: { ...state.education, [path.sourceId]: value },
      };
    case "skill":
      return { ...state, skills: { ...state.skills, [path.skillId]: value } };
    case "link":
      return { ...state, links: { ...state.links, [path.linkId]: value } };
  }
}
