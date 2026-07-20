"use client";

import { useTransition } from "react";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { BulletListEditor } from "./BulletListEditor";

type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "checkbox";
};

export function EntryCard({
  entryId,
  fields,
  values,
  bullets,
  saveAction,
  deleteAction,
  moveAction,
}: {
  entryId: string;
  fields: Field[];
  values: Record<string, unknown>;
  bullets?: string[];
  saveAction: (entryId: string, formData: FormData) => Promise<void>;
  deleteAction: (entryId: string) => Promise<void>;
  moveAction: (entryId: string, direction: "up" | "down") => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <PuzzleCard className="bg-white p-6 flex flex-col gap-4">
      <form
        action={saveAction.bind(null, entryId)}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map((field) => (
            <label
              key={field.name}
              className={
                field.type === "textarea"
                  ? "col-span-2 flex flex-col gap-1"
                  : "flex flex-col gap-1"
              }
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                {field.label}
              </span>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  defaultValue={String(values[field.name] ?? "")}
                  rows={3}
                  className="border-2 border-black px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
                />
              ) : field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  name={field.name}
                  defaultChecked={Boolean(values[field.name])}
                  className="h-5 w-5 border-2 border-black self-start"
                />
              ) : (
                <input
                  type="text"
                  name={field.name}
                  defaultValue={String(values[field.name] ?? "")}
                  className="border-2 border-black px-2 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
                />
              )}
            </label>
          ))}
        </div>

        {bullets && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider">
              Bullets
            </span>
            <BulletListEditor initialBullets={bullets} />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Move up"
              onClick={() => startTransition(() => moveAction(entryId, "up"))}
              className="h-9 w-9 border-2 border-black flex items-center justify-center hover:bg-slate-100"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              aria-label="Move down"
              onClick={() =>
                startTransition(() => moveAction(entryId, "down"))
              }
              className="h-9 w-9 border-2 border-black flex items-center justify-center hover:bg-slate-100"
            >
              <ChevronDown size={16} />
            </button>
            <button
              type="button"
              aria-label="Delete entry"
              onClick={() => {
                if (confirm("Delete this entry?")) {
                  startTransition(() => deleteAction(entryId));
                }
              }}
              className="h-9 w-9 border-2 border-black flex items-center justify-center hover:bg-puzzle-red hover:text-white"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <BlueprintButton
            type="submit"
            variant="primary"
            className="px-6 h-10"
            disabled={isPending}
          >
            Save
          </BlueprintButton>
        </div>
      </form>
    </PuzzleCard>
  );
}
