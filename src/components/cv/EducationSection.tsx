"use client";

import { useTransition } from "react";
import { School } from "lucide-react";
import { PuzzleTag } from "@/components/puzzle/PuzzleTag";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { EntryCard } from "./EntryCard";
import {
  createEducationEntry,
  saveEducationEntry,
  deleteEducationEntry,
  moveEducationEntry,
} from "@/app/(protected)/cv/actions";
import type { EducationEntry } from "@/lib/types/cv";

const FIELDS = [
  { name: "institution", label: "Institution" },
  { name: "degree", label: "Degree" },
  { name: "field_of_study", label: "Field of Study" },
  { name: "gpa", label: "GPA" },
  { name: "start_date", label: "Start Date" },
  { name: "end_date", label: "End Date" },
];

export function EducationSection({ entries }: { entries: EducationEntry[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <section className="flex flex-col gap-4">
      <PuzzleTag
        icon={School}
        title={"Academic\nInfo"}
        subtitle="Education & Degrees"
        color="blue"
        className="w-fit"
      />
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entryId={entry.id}
          fields={FIELDS}
          values={entry}
          bullets={entry.education_bullets.map((b) => b.content)}
          saveAction={saveEducationEntry}
          deleteAction={deleteEducationEntry}
          moveAction={moveEducationEntry}
        />
      ))}
      <BlueprintButton
        type="button"
        variant="secondary"
        className="w-fit px-6 h-12"
        disabled={isPending}
        onClick={() => startTransition(() => createEducationEntry())}
      >
        + Add Education
      </BlueprintButton>
    </section>
  );
}
