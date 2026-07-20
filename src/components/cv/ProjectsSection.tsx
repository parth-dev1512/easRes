"use client";

import { useTransition } from "react";
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

export function ProjectsSection({ entries }: { entries: ProjectEntry[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <section className="flex flex-col gap-4">
      <PuzzleTag
        icon={Rocket}
        title={"Project\nCases"}
        subtitle="Portfolio Highlights"
        color="yellow"
        className="w-fit"
      />
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entryId={entry.id}
          fields={FIELDS}
          values={{ ...entry, tech_stack: (entry.tech_stack ?? []).join(", ") }}
          bullets={entry.project_bullets.map((b) => b.content)}
          saveAction={saveProjectEntry}
          deleteAction={deleteProjectEntry}
          moveAction={moveProjectEntry}
        />
      ))}
      <BlueprintButton
        type="button"
        variant="secondary"
        className="w-fit px-6 h-12"
        disabled={isPending}
        onClick={() => startTransition(() => createProjectEntry())}
      >
        + Add Project
      </BlueprintButton>
    </section>
  );
}
