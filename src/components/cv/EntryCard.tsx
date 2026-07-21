"use client";

import { useState, useTransition } from "react";
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
  collapsible = false,
  dense = false,
  summaryTitle,
  summarySubtitle,
}: {
  entryId: string;
  fields: Field[];
  values: Record<string, unknown>;
  bullets?: string[];
  saveAction: (entryId: string, formData: FormData) => Promise<void>;
  deleteAction: (entryId: string) => void;
  moveAction: (entryId: string, direction: "up" | "down") => void;
  collapsible?: boolean;
  dense?: boolean;
  summaryTitle?: string;
  summarySubtitle?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [collapsed, setCollapsed] = useState(false);

  const showForm = !collapsible || !collapsed;

  return (
    <PuzzleCard className="bg-white overflow-hidden">
      {collapsible && (
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          className="w-full flex items-center justify-between gap-3 px-6 py-3.5 text-left hover:bg-slate-50"
        >
          <span className="flex flex-col min-w-0">
            <span className="font-[900] uppercase italic tracking-tight truncate">
              {summaryTitle || "Untitled"}
            </span>
            {summarySubtitle && (
              <span className="text-xs text-slate-500 truncate">
                {summarySubtitle}
              </span>
            )}
          </span>
          <ChevronDown
            size={20}
            className={`shrink-0 transition-transform ${
              collapsed ? "-rotate-90" : ""
            }`}
          />
        </button>
      )}

      {showForm && (
        <form
          action={saveAction.bind(null, entryId)}
          className={
            collapsible
              ? "flex flex-col gap-4 px-6 pb-6 pt-1 border-t-2 border-black"
              : "flex flex-col gap-4 p-6"
          }
        >
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              dense ? "lg:grid-cols-3" : ""
            } gap-3`}
          >
            {fields.map((field) => (
              <label
                key={field.name}
                className={
                  field.type === "textarea"
                    ? "col-span-full flex flex-col gap-1"
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
      )}
    </PuzzleCard>
  );
}
