import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { buildTailorPrompt } from "@/lib/gemini/prompt";
import { GeneratedContentSchema, type GeneratedContent } from "@/lib/gemini/schema";
import { ParsedResumeSchema, type ParsedResume } from "@/lib/gemini/importSchema";
import { RESUME_IMPORT_PROMPT } from "@/lib/gemini/importPrompt";
import type { MasterCv } from "@/lib/types/cv";

// Temporary swap from Gemini -> Claude. To switch back, point the two API
// routes' imports at "@/lib/gemini/client" again.
const MODEL = "claude-sonnet-5";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  return new Anthropic({ apiKey });
}

/**
 * Retries the RateLimitError/APIStatusError distinction as plain Error
 * messages so the existing route-level string checks (rate limit/quota/etc.)
 * keep working unchanged.
 */
function normalizeError(err: unknown): Error {
  if (err instanceof Anthropic.RateLimitError) {
    return new Error(`Claude rate limit: ${err.message}`);
  }
  if (err instanceof Anthropic.APIError) {
    return new Error(`Claude API error (${err.status}): ${err.message}`);
  }
  return err instanceof Error ? err : new Error(String(err));
}

async function callClaude<T>(
  prompt: string,
  schema: Parameters<typeof zodOutputFormat>[0],
  extraContent?: Anthropic.Messages.ContentBlockParam[]
): Promise<T | null> {
  const client = getClient();
  const content: Anthropic.Messages.ContentBlockParam[] = extraContent
    ? [...extraContent, { type: "text", text: prompt }]
    : [{ type: "text", text: prompt }];

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(schema),
    },
    messages: [{ role: "user", content }],
  });

  return response.parsed_output as T | null;
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

  let parsed: GeneratedContent | null;
  try {
    parsed = await callClaude<GeneratedContent>(prompt, GeneratedContentSchema);
  } catch (err) {
    throw normalizeError(err);
  }

  if (!parsed) {
    const retryPrompt = `${prompt}\n\nYour previous response failed schema validation. Return valid JSON only, matching the schema exactly.`;
    try {
      parsed = await callClaude<GeneratedContent>(retryPrompt, GeneratedContentSchema);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  if (!parsed) {
    throw new Error("Claude response failed schema validation");
  }

  return sanitizeAgainstMasterCv(parsed, cv);
}

export async function parseResumePdf(base64Pdf: string): Promise<ParsedResume> {
  const pdfBlock: Anthropic.Messages.ContentBlockParam = {
    type: "document",
    source: { type: "base64", media_type: "application/pdf", data: base64Pdf },
  };

  let parsed: ParsedResume | null;
  try {
    parsed = await callClaude<ParsedResume>(RESUME_IMPORT_PROMPT, ParsedResumeSchema, [
      pdfBlock,
    ]);
  } catch (err) {
    throw normalizeError(err);
  }

  if (!parsed) {
    const retryPrompt = `${RESUME_IMPORT_PROMPT}\n\nYour previous response failed schema validation. Return valid JSON only, matching the schema exactly.`;
    try {
      parsed = await callClaude<ParsedResume>(retryPrompt, ParsedResumeSchema, [pdfBlock]);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  if (!parsed) {
    throw new Error("Claude response failed schema validation");
  }

  return parsed;
}
