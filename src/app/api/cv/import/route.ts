import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseLinkedInPdf } from "@/lib/linkedin/parse";
import { importParsedResume } from "@/lib/data/importCv";

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

  try {
    const parsed = await parseLinkedInPdf(new Uint8Array(await file.arrayBuffer()));
    const summary = await importParsedResume(user.id, parsed);
    return NextResponse.json({ summary });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_LINKEDIN_PDF") {
      return NextResponse.json(
        {
          error:
            "That doesn't look like a LinkedIn profile PDF. Use Profile → Resources → Save to PDF on LinkedIn.",
        },
        { status: 422 }
      );
    }

    console.error("CV import error:", err);
    return NextResponse.json(
      { error: "Couldn't read that PDF. Please try again." },
      { status: 500 }
    );
  }
}
