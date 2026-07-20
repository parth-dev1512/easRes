"use client";

import { useRef, useTransition } from "react";
import { Terminal, X } from "lucide-react";
import { PuzzleTag } from "@/components/puzzle/PuzzleTag";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { createSkill, deleteSkill } from "@/app/(protected)/cv/actions";
import type { Skill } from "@/lib/types/cv";

export function SkillsSection({ skills }: { skills: Skill[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <section className="flex flex-col gap-4">
      <PuzzleTag
        icon={Terminal}
        title={"Tech\nSkills"}
        subtitle="Stack & Competencies"
        color="green"
        className="w-fit"
      />
      <PuzzleCard className="bg-white p-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="flex items-center gap-2 border-2 border-black px-3 h-9 text-sm font-medium"
            >
              {skill.category !== "General" && (
                <span className="text-xs text-slate-500">
                  {skill.category}:
                </span>
              )}
              {skill.name}
              <button
                type="button"
                aria-label="Remove skill"
                onClick={() => startTransition(() => deleteSkill(skill.id))}
                className="text-puzzle-red"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <form
          ref={formRef}
          action={(formData) => {
            startTransition(() => createSkill(formData));
            formRef.current?.reset();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            name="category"
            placeholder="Category (optional)"
            className="border-2 border-black px-3 h-10 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
          />
          <input
            type="text"
            name="name"
            required
            placeholder="Skill name"
            className="border-2 border-black px-3 h-10 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
          />
          <BlueprintButton
            type="submit"
            variant="secondary"
            className="px-6 h-10"
            disabled={isPending}
          >
            Add
          </BlueprintButton>
        </form>
      </PuzzleCard>
    </section>
  );
}
