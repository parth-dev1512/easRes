import { GoogleGenAI } from "@google/genai";
import { buildTailorPrompt } from "@/lib/gemini/prompt";
import {
  GeneratedContentSchema,
  GENERATED_CONTENT_JSON_SCHEMA,
  type GeneratedContent,
} from "@/lib/gemini/schema";
import {
  ParsedResumeSchema,
  PARSED_RESUME_JSON_SCHEMA,
  type ParsedResume,
} from "@/lib/gemini/importSchema";
import { RESUME_IMPORT_PROMPT } from "@/lib/gemini/importPrompt";
import type { MasterCv } from "@/lib/types/cv";

// "-latest" alias always points at Google's current recommended flash-tier
// model, so this doesn't need to be updated by hand as models are deprecated.
const MODEL = "gemini-flash-latest";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

async function callGemini(prompt: string): Promise<unknown> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: GENERATED_CONTENT_JSON_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response");
  return JSON.parse(text);
}

/**
 * Drops any sourceId/sourceBulletId the model returned that doesn't actually
 * exist in the master CV we sent it. This — not the prompt wording — is the
 * real enforcement of "never fabricate": the model is never trusted, only
 * ids we independently verify are kept.
 */
function sanitizeAgainstMasterCv(
  content: GeneratedContent,
  cv: MasterCv
): GeneratedContent {
  const experienceIds = new Set(cv.experience.map((e) => e.id));
  const experienceBulletIds = new Set(
    cv.experience.flatMap((e) => e.experience_bullets.map((b) => b.id))
  );
  const projectIds = new Set(cv.projects.map((p) => p.id));
  const projectBulletIds = new Set(
    cv.projects.flatMap((p) => p.project_bullets.map((b) => b.id))
  );
  const educationIds = new Set(cv.education.map((e) => e.id));

  return {
    ...content,
    experience: content.experience
      .filter((e) => experienceIds.has(e.sourceId))
      .map((e) => ({
        ...e,
        bullets: e.bullets.filter(
          (b) => b.sourceBulletId === null || experienceBulletIds.has(b.sourceBulletId)
        ),
      })),
    projects: content.projects
      .filter((p) => projectIds.has(p.sourceId))
      .map((p) => ({
        ...p,
        bullets: p.bullets.filter(
          (b) => b.sourceBulletId === null || projectBulletIds.has(b.sourceBulletId)
        ),
      })),
    education: content.education.filter((e) => educationIds.has(e.sourceId)),
  };
}

export async function tailorResume(
  cv: MasterCv,
  jobDescription: string
): Promise<GeneratedContent> {
  const prompt = buildTailorPrompt(cv, jobDescription);

  let raw = await callGemini(prompt);
  let parsed = GeneratedContentSchema.safeParse(raw);

  if (!parsed.success) {
    const retryPrompt = `${prompt}\n\nYour previous response failed schema validation with this error:\n${parsed.error.message}\n\nReturn valid JSON only, matching the schema exactly.`;
    raw = await callGemini(retryPrompt);
    parsed = GeneratedContentSchema.safeParse(raw);
  }

  if (!parsed.success) {
    throw new Error(`Gemini response failed schema validation: ${parsed.error.message}`);
  }

  return sanitizeAgainstMasterCv(parsed.data, cv);
}

async function callGeminiWithPdf(
  promptText: string,
  base64Pdf: string
): Promise<unknown> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: promptText },
          { inlineData: { mimeType: "application/pdf", data: base64Pdf } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: PARSED_RESUME_JSON_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response");
  return JSON.parse(text);
}

export async function parseResumePdf(base64Pdf: string): Promise<ParsedResume> {
  let raw = await callGeminiWithPdf(RESUME_IMPORT_PROMPT, base64Pdf);
  let parsed = ParsedResumeSchema.safeParse(raw);

  if (!parsed.success) {
    const retryPrompt = `${RESUME_IMPORT_PROMPT}\n\nYour previous response failed schema validation with this error:\n${parsed.error.message}\n\nReturn valid JSON only, matching the schema exactly.`;
    raw = await callGeminiWithPdf(retryPrompt, base64Pdf);
    parsed = ParsedResumeSchema.safeParse(raw);
  }

  if (!parsed.success) {
    throw new Error(`Gemini response failed schema validation: ${parsed.error.message}`);
  }

  return parsed.data;
}
