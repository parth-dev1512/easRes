"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { ToggleTree } from "@/components/resume/ToggleTree";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { applyToggle, type TogglePath } from "@/lib/resume/toggleReducer";
import { saveTailoredResume } from "@/app/(protected)/tailor/actions";
import type { MasterCv } from "@/lib/types/cv";
import type { GeneratedContent } from "@/lib/gemini/schema";
import type { ToggleState } from "@/lib/types/resume";

type Status = "idle" | "generating" | "ready" | "error";

export function TailorWorkspace({
  cv,
  resumeId: initialResumeId,
  initialJobDescription = "",
  initialTitle = "",
  initialCompanyName = "",
  initialGeneratedContent = null,
  initialToggleState = null,
}: {
  cv: MasterCv;
  resumeId?: string;
  initialJobDescription?: string;
  initialTitle?: string;
  initialCompanyName?: string;
  initialGeneratedContent?: GeneratedContent | null;
  initialToggleState?: ToggleState | null;
}) {
  const router = useRouter();
  const [resumeId, setResumeId] = useState<string | undefined>(initialResumeId);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [title, setTitle] = useState(initialTitle);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(
    initialGeneratedContent
  );
  const [toggleState, setToggleState] = useState<ToggleState | null>(initialToggleState);
  const [status, setStatus] = useState<Status>(initialGeneratedContent ? "ready" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  async function handleGenerate() {
    setStatus("generating");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setGeneratedContent(json.generatedContent);
      setToggleState(json.defaultToggleState);
      setResumeId(undefined); // a fresh generation is a new, unsaved resume
      setSaveState("idle");
      setStatus("ready");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  function handleToggle(path: TogglePath, value: boolean) {
    setToggleState((prev) => (prev ? applyToggle(prev, path, value) : prev));
    setSaveState("idle");
  }

  async function handleSave() {
    if (!generatedContent || !toggleState) return;
    setSaveState("saving");
    try {
      const result = await saveTailoredResume({
        resumeId,
        jobDescription,
        title: title || undefined,
        companyName: companyName || undefined,
        generatedContent,
        toggleState,
      });
      setResumeId(result.id);
      setSaveState("saved");
      router.refresh();
    } catch {
      setSaveState("idle");
      setErrorMessage("Failed to save. Please try again.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-4">
        <PuzzleCard className="bg-white p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-[900] uppercase italic tracking-tighter">
            Job Description
          </h2>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            placeholder="Paste the job description here..."
            className="border-2 border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
          />
          {errorMessage && (
            <p className="text-sm font-medium text-puzzle-red">{errorMessage}</p>
          )}
          <BlueprintButton
            type="button"
            variant="primary"
            disabled={jobDescription.trim().length < 50 || status === "generating"}
            onClick={handleGenerate}
          >
            {status === "generating" ? "Assembling..." : "Assemble Resume"}
          </BlueprintButton>
          {jobDescription.trim().length > 0 && jobDescription.trim().length < 50 && (
            <p className="text-xs text-slate-500">
              Paste at least 50 characters of the job description.
            </p>
          )}
        </PuzzleCard>

        {generatedContent && toggleState && (
          <PuzzleCard className="bg-white p-6 flex flex-col gap-4">
            <h2 className="text-2xl font-[900] uppercase italic tracking-tighter">
              Save
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Title
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setSaveState("idle");
                  }}
                  placeholder="e.g. Data Engineer @ DataForge"
                  className="border-2 border-black px-2 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Company
                </span>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setSaveState("idle");
                  }}
                  className="border-2 border-black px-2 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
                />
              </label>
            </div>
            <div className="flex items-center justify-between">
              {saveState === "saved" && (
                <span className="text-sm font-medium text-puzzle-green">
                  Saved.
                </span>
              )}
              <BlueprintButton
                type="button"
                variant="primary"
                className="ml-auto px-6"
                disabled={saveState === "saving"}
                onClick={handleSave}
              >
                {saveState === "saving" ? "Saving..." : resumeId ? "Update" : "Save Resume"}
              </BlueprintButton>
            </div>
          </PuzzleCard>
        )}

        {generatedContent && toggleState && (
          <PuzzleCard className="bg-white p-6">
            <h2 className="text-2xl font-[900] uppercase italic tracking-tighter mb-4">
              Toggle Sections
            </h2>
            <ToggleTree
              cv={cv}
              content={generatedContent}
              toggleState={toggleState}
              onToggle={handleToggle}
            />
          </PuzzleCard>
        )}
      </div>

      <div className="lg:sticky lg:top-6 self-start">
        <div className="w-full bg-white border border-slate-200 resume-shadow p-10 min-h-[600px]">
          {generatedContent && toggleState ? (
            <ResumePreview cv={cv} content={generatedContent} toggleState={toggleState} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Paste a job description and click &quot;Assemble Resume&quot; to see
              your tailored resume here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
