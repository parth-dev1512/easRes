"use client";

import { useTransition } from "react";
import { Briefcase } from "lucide-react";
import { PuzzleTag } from "@/components/puzzle/PuzzleTag";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { EntryCard } from "./EntryCard";
import {
  createExperienceEntry,
  saveExperienceEntry,
  deleteExperienceEntry,
  moveExperienceEntry,
} from "@/app/(protected)/cv/actions";
import type { ExperienceEntry } from "@/lib/types/cv";

const FIELDS = [
  { name: "company", label: "Company" },
  { name: "role_title", label: "Role Title" },
  { name: "location", label: "Location" },
  { name: "start_date", label: "Start Date" },
  { name: "end_date", label: "End Date" },
  { name: "is_current", label: "Current Role", type: "checkbox" as const },
];

export function ExperienceSection({ entries }: { entries: ExperienceEntry[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <section className="flex flex-col gap-4">
      <PuzzleTag
        icon={Briefcase}
        title={"Work\nHistory"}
        subtitle="Professional Career Log"
        color="red"
        className="w-fit"
      />
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entryId={entry.id}
          fields={FIELDS}
          values={entry}
          bullets={entry.experience_bullets.map((b) => b.content)}
          saveAction={saveExperienceEntry}
          deleteAction={deleteExperienceEntry}
          moveAction={moveExperienceEntry}
        />
      ))}
      <BlueprintButton
        type="button"
        variant="secondary"
        className="w-fit px-6 h-12"
        disabled={isPending}
        onClick={() => startTransition(() => createExperienceEntry())}
      >
        + Add Experience
      </BlueprintButton>
    </section>
  );
}
