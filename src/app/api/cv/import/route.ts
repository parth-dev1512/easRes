import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseResumePdf } from "@/lib/gemini/client";
import { importParsedResume } from "@/lib/data/importCv";

export const maxDuration = 60;

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Please upload a PDF file" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 8MB)" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64Pdf = Buffer.from(arrayBuffer).toString("base64");

  try {
    const parsed = await parseResumePdf(base64Pdf);
    const summary = await importParsedResume(user.id, parsed);
    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json({ error: "AI is not configured" }, { status: 503 });
    }
    if (message.includes("schema validation")) {
      return NextResponse.json(
        { error: "Couldn't read that PDF's structure. Please try again." },
        { status: 502 }
      );
    }

    console.error("CV import error:", err);
    return NextResponse.json(
      { error: "Failed to import the PDF. Please try again." },
      { status: 503 }
    );
  }
}
