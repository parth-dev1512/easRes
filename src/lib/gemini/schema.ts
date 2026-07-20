import { z } from "zod";

export const TailoredBulletSchema = z.object({
  sourceBulletId: z.string().nullable(),
  text: z.string(),
  relevanceScore: z.number().min(0).max(100),
});

export const TailoredEntrySchema = z.object({
  sourceId: z.string(),
  relevanceScore: z.number().min(0).max(100),
  bullets: z.array(TailoredBulletSchema),
});

export const TailoredEducationSchema = z.object({
  sourceId: z.string(),
  include: z.boolean(),
});

export const GeneratedContentSchema = z.object({
  summary: z.string(),
  headline: z.string().nullable(),
  skillsEmphasis: z.array(z.string()),
  experience: z.array(TailoredEntrySchema),
  projects: z.array(TailoredEntrySchema),
  education: z.array(TailoredEducationSchema),
});

export type TailoredBullet = z.infer<typeof TailoredBulletSchema>;
export type TailoredEntry = z.infer<typeof TailoredEntrySchema>;
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;

// Hand-authored JSON Schema (subset Gemini supports) mirroring the zod shape
// above, passed as `responseJsonSchema` to structurally constrain output.
export const GENERATED_CONTENT_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    headline: { type: ["string", "null"] },
    skillsEmphasis: { type: "array", items: { type: "string" } },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sourceId: { type: "string" },
          relevanceScore: { type: "number" },
          bullets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sourceBulletId: { type: ["string", "null"] },
                text: { type: "string" },
                relevanceScore: { type: "number" },
              },
              required: ["sourceBulletId", "text", "relevanceScore"],
            },
          },
        },
        required: ["sourceId", "relevanceScore", "bullets"],
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sourceId: { type: "string" },
          relevanceScore: { type: "number" },
          bullets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sourceBulletId: { type: ["string", "null"] },
                text: { type: "string" },
                relevanceScore: { type: "number" },
              },
              required: ["sourceBulletId", "text", "relevanceScore"],
            },
          },
        },
        required: ["sourceId", "relevanceScore", "bullets"],
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sourceId: { type: "string" },
          include: { type: "boolean" },
        },
        required: ["sourceId", "include"],
      },
    },
  },
  required: [
    "summary",
    "headline",
    "skillsEmphasis",
    "experience",
    "projects",
    "education",
  ],
} as const;
