import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getMasterCv } from "@/lib/data/cv";
import { tailorResume } from "@/lib/claude/client";
import { computeDefaultToggleState } from "@/lib/types/resume";

export const maxDuration = 30;

const TailorRequestSchema = z.object({
  jobDescription: z.string().trim().min(50).max(10000),
  title: z.string().trim().max(200).optional(),
  companyName: z.string().trim().max(200).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = TailorRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0].message },
      { status: 400 }
    );
  }

  const cv = await getMasterCv(user.id);

  try {
    const generatedContent = await tailorResume(cv, parsedBody.data.jobDescription);
    const defaultToggleState = computeDefaultToggleState(generatedContent, cv);
    return NextResponse.json({ generatedContent, defaultToggleState });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: "AI is not configured" }, { status: 503 });
    }
    if (message.includes("schema validation")) {
      return NextResponse.json(
        { error: "AI returned an unexpected format. Please try again." },
        { status: 502 }
      );
    }
    if (
      message.toLowerCase().includes("rate limit") ||
      message.toLowerCase().includes("429") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("resource_exhausted") ||
      message.toLowerCase().includes("billing")
    ) {
      return NextResponse.json(
        { error: "Service exhausted right now, try after some time." },
        { status: 429 }
      );
    }

    console.error("Tailor pipeline error:", err);
    return NextResponse.json(
      { error: "Service exhausted right now, try after some time." },
      { status: 503 }
    );
  }
}
