"use client";

import { useRef, useState, useTransition } from "react";
import { Terminal, X, ChevronDown } from "lucide-react";
import { PuzzleTag } from "@/components/puzzle/PuzzleTag";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { createSkill, deleteSkill } from "@/app/(protected)/cv/actions";
import type { Skill } from "@/lib/types/cv";

export function SkillsSection({ skills: initialSkills }: { skills: Skill[] }) {
  const [skills, setSkills] = useState(initialSkills);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  function handleDelete(skillId: string) {
    const snapshot = skills;
    setSkills((s) => s.filter((sk) => sk.id !== skillId));
    deleteSkill(skillId).catch(() => setSkills(snapshot));
  }

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const row = await createSkill(formData);
      setSkills((s) => [...s, row as Skill]);
    });
    formRef.current?.reset();
  }

  return (
    <section className="flex flex-col gap-4 lg:-mx-24 lg:w-[calc(100%+12rem)] xl:-mx-40 xl:w-[calc(100%+20rem)]">
      <div className="flex items-center gap-3">
        <PuzzleTag
          icon={Terminal}
          title={"Tech\nSkills"}
          subtitle="Stack & Competencies"
          color="green"
          className="w-fit"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle skills"
          aria-expanded={open}
          className="h-10 w-10 border-2 border-black flex items-center justify-center hover:bg-slate-100 shrink-0"
        >
          <ChevronDown
            size={18}
            className={`transition-transform ${open ? "" : "-rotate-90"}`}
          />
        </button>
      </div>
      {open && (
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
                onClick={() => handleDelete(skill.id)}
                className="text-puzzle-red"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <form
          ref={formRef}
          action={handleCreate}
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
      )}
    </section>
  );
}
