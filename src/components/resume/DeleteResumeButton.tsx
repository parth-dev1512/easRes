"use client";

import { useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { deleteResume } from "@/app/(protected)/tailor/actions";

export function DeleteResumeButton({ resumeId }: { resumeId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Delete resume"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this saved resume?")) {
          startTransition(() => deleteResume(resumeId));
        }
      }}
      className="h-9 w-9 border-2 border-black flex items-center justify-center hover:bg-puzzle-red hover:text-white active:scale-90 disabled:opacity-40 transition-transform shrink-0"
    >
      {isPending ? (
        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
