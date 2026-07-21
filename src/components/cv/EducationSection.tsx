"use client";

import { useState, useTransition } from "react";
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

export function EducationSection({ entries: initialEntries }: { entries: EducationEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [isPending, startTransition] = useTransition();

  function handleDelete(entryId: string) {
    const snapshot = entries;
    setEntries((es) => es.filter((e) => e.id !== entryId));
    deleteEducationEntry(entryId).catch(() => setEntries(snapshot));
  }

  function handleMove(entryId: string, direction: "up" | "down") {
    const index = entries.findIndex((e) => e.id === entryId);
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || neighborIndex < 0 || neighborIndex >= entries.length) return;

    const snapshot = entries;
    const next = [...entries];
    [next[index], next[neighborIndex]] = [next[neighborIndex], next[index]];
    setEntries(next);
    moveEducationEntry(entryId, direction).catch(() => setEntries(snapshot));
  }

  function handleCreate() {
    startTransition(async () => {
      const row = await createEducationEntry();
      setEntries((es) => [...es, { ...row, education_bullets: [] } as EducationEntry]);
    });
  }

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
        + Add Education
      </BlueprintButton>
    </section>
  );
}
