"use client";

import { useState, useTransition } from "react";
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

export function ExperienceSection({ entries: initialEntries }: { entries: ExperienceEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [isPending, startTransition] = useTransition();

  function handleDelete(entryId: string) {
    const snapshot = entries;
    setEntries((es) => es.filter((e) => e.id !== entryId));
    deleteExperienceEntry(entryId).catch(() => setEntries(snapshot));
  }

  function handleMove(entryId: string, direction: "up" | "down") {
    const index = entries.findIndex((e) => e.id === entryId);
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || neighborIndex < 0 || neighborIndex >= entries.length) return;

    const snapshot = entries;
    const next = [...entries];
    [next[index], next[neighborIndex]] = [next[neighborIndex], next[index]];
    setEntries(next);
    moveExperienceEntry(entryId, direction).catch(() => setEntries(snapshot));
  }

  function handleCreate() {
    startTransition(async () => {
      const row = await createExperienceEntry();
      setEntries((es) => [...es, { ...row, experience_bullets: [] } as ExperienceEntry]);
    });
  }

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
          deleteAction={handleDelete}
          moveAction={handleMove}
        />
      ))}
      <BlueprintButton
        type="button"
        variant="secondary"
        className="w-fit px-6 h-12"
        disabled={isPending}
        onClick={handleCreate}
      >
        + Add Experience
      </BlueprintButton>
    </section>
  );
}
