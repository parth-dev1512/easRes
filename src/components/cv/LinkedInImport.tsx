"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import type { ImportSummary } from "@/lib/data/importCv";

type Status = "idle" | "uploading" | "done" | "error";

function LinkedInLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.56V9h3.554v11.452z" />
    </svg>
  );
}

export function LinkedInImport() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  function closeModal() {
    if (status === "uploading") return;
    setOpen(false);
    setStatus("idle");
    setMessage(null);
    if (fileRef.current) fileRef.current.value = "";
  }

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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 w-full border-4 border-black px-5 py-4 bg-[#0A66C2] text-white font-[900] uppercase tracking-widest text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
      >
        <LinkedInLogo className="h-6 w-6 shrink-0" />
        Import from LinkedIn
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <PuzzleCard
            className="bg-white w-full max-w-md p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {status === "uploading" ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="h-10 w-10 rounded-full border-4 border-[#0A66C2] border-t-transparent animate-spin" />
                <p className="font-[900] uppercase italic tracking-tight">
                  Getting your things from LinkedIn&hellip;
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-[900] uppercase italic tracking-tighter flex items-center gap-2">
                    <LinkedInLogo className="h-5 w-5 text-[#0A66C2]" />
                    Import from LinkedIn
                  </h2>
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close"
                    className="text-xl font-bold leading-none px-1"
                  >
                    &times;
                  </button>
                </div>
                <p className="text-sm text-slate-600">
                  Export your LinkedIn profile as a PDF (Profile &rarr; Resources
                  &rarr; Save to PDF) and upload it here. New entries are added
                  to your CV below &mdash; nothing existing gets overwritten or
                  removed.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="border-2 border-black px-2 py-1.5 text-sm file:mr-3 file:h-full file:border-0 file:bg-black file:text-white file:px-3 file:py-1.5 file:font-bold file:uppercase file:text-xs"
                />
                {message && (
                  <p
                    className={`text-sm font-medium ${
                      status === "error" ? "text-puzzle-red" : "text-puzzle-green"
                    }`}
                  >
                    {message}
                  </p>
                )}
                <BlueprintButton
                  type="button"
                  variant="primary"
                  onClick={handleImport}
                >
                  Import PDF
                </BlueprintButton>
              </>
            )}
          </PuzzleCard>
        </div>
      )}
    </>
  );
}
