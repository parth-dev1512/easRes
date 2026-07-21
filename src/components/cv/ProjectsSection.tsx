"use client";

import { useState, useTransition } from "react";
import { Rocket } from "lucide-react";
import { PuzzleTag } from "@/components/puzzle/PuzzleTag";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { EntryCard } from "./EntryCard";
import {
  createProjectEntry,
  saveProjectEntry,
  deleteProjectEntry,
  moveProjectEntry,
} from "@/app/(protected)/cv/actions";
import type { ProjectEntry } from "@/lib/types/cv";

const FIELDS = [
  { name: "name", label: "Project Name" },
  { name: "url", label: "URL" },
  { name: "start_date", label: "Start Date" },
  { name: "end_date", label: "End Date" },
  { name: "tech_stack", label: "Tech Stack (comma separated)" },
  { name: "description", label: "Description", type: "textarea" as const },
];

export function ProjectsSection({ entries: initialEntries }: { entries: ProjectEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [isPending, startTransition] = useTransition();

  function handleDelete(entryId: string) {
    const snapshot = entries;
    setEntries((es) => es.filter((e) => e.id !== entryId));
    deleteProjectEntry(entryId).catch(() => setEntries(snapshot));
  }

  function handleMove(entryId: string, direction: "up" | "down") {
    const index = entries.findIndex((e) => e.id === entryId);
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || neighborIndex < 0 || neighborIndex >= entries.length) return;

    const snapshot = entries;
    const next = [...entries];
    [next[index], next[neighborIndex]] = [next[neighborIndex], next[index]];
    setEntries(next);
    moveProjectEntry(entryId, direction).catch(() => setEntries(snapshot));
  }

  function handleCreate() {
    startTransition(async () => {
      const row = await createProjectEntry();
      setEntries((es) => [...es, { ...row, project_bullets: [] } as ProjectEntry]);
    });
  }

  return (
    <section className="flex flex-col gap-4 lg:-mx-24 lg:w-[calc(100%+12rem)] xl:-mx-40 xl:w-[calc(100%+20rem)]">
      <PuzzleTag
        icon={Rocket}
        title={"Project\nCases"}
        subtitle="Portfolio Highlights"
        color="yellow"
        className="w-fit"
      />
      {entries.map((entry) => {
        const dateRange = `${entry.start_date || "?"} – ${entry.end_date || "?"}`;
        return (
          <EntryCard
            key={entry.id}
            entryId={entry.id}
            fields={FIELDS}
            values={{ ...entry, tech_stack: (entry.tech_stack ?? []).join(", ") }}
            bullets={entry.project_bullets.map((b) => b.content)}
            saveAction={saveProjectEntry}
            deleteAction={handleDelete}
            moveAction={handleMove}
            collapsible
            dense
            summaryTitle={entry.name || "Untitled Project"}
            summarySubtitle={dateRange}
          />
        );
      })}
      <BlueprintButton
        type="button"
        variant="secondary"
        className="w-fit px-6 h-12"
        disabled={isPending}
        onClick={handleCreate}
      >
        + Add Project
      </BlueprintButton>
    </section>
  );
}
