"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import type { ImportSummary } from "@/lib/data/importCv";

type Status = "idle" | "uploading" | "done" | "error";

export function LinkedInImport() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setStatus("error");
      setMessage("Choose a PDF file first.");
      return;
    }

    setStatus("uploading");
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cv/import", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(json.error ?? "Import failed.");
        return;
      }

      const summary: ImportSummary = json.summary;
      const parts = [
        summary.experience && `${summary.experience} experience`,
        summary.education && `${summary.education} education`,
        summary.projects && `${summary.projects} project`,
        summary.skills && `${summary.skills} skill`,
        summary.links && `${summary.links} link`,
      ].filter(Boolean);

      setStatus("done");
      setMessage(
        parts.length > 0
          ? `Imported ${parts.join(", ")} entries below.`
          : "Nothing new was found in that PDF."
      );
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <PuzzleCard className="bg-white p-6 flex flex-col gap-3">
      <h2 className="text-2xl font-[900] uppercase italic tracking-tighter">
        Import from LinkedIn
      </h2>
      <p className="text-sm text-slate-600">
        Export your LinkedIn profile as a PDF (Profile &rarr; Resources &rarr;
        Save to PDF) and upload it here. New entries are added to your CV
        below &mdash; nothing existing gets overwritten or removed.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="border-2 border-black px-2 py-1.5 text-sm flex-1 file:mr-3 file:h-full file:border-0 file:bg-black file:text-white file:px-3 file:py-1.5 file:font-bold file:uppercase file:text-xs"
        />
        <BlueprintButton
          type="button"
          variant="primary"
          className="px-6"
          disabled={status === "uploading"}
          onClick={handleImport}
        >
          {status === "uploading" ? "Parsing..." : "Import PDF"}
        </BlueprintButton>
      </div>
      {message && (
        <p
          className={`text-sm font-medium ${
            status === "error" ? "text-puzzle-red" : "text-puzzle-green"
          }`}
        >
          {message}
        </p>
      )}
    </PuzzleCard>
  );
}
