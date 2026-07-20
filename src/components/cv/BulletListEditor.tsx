"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

type Row = { id: string; value: string };

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `row-${Math.random().toString(36).slice(2)}`;
}

export function BulletListEditor({ initialBullets }: { initialBullets: string[] }) {
  const [rows, setRows] = useState<Row[]>(() =>
    (initialBullets.length ? initialBullets : [""]).map((value) => ({
      id: newId(),
      value,
    }))
  );

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.id} className="flex gap-2 items-start">
          <textarea
            name="bullet_content"
            value={row.value}
            onChange={(e) =>
              setRows((prev) =>
                prev.map((r) =>
                  r.id === row.id ? { ...r, value: e.target.value } : r
                )
              )
            }
            rows={2}
            className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
          />
          <button
            type="button"
            aria-label="Remove bullet"
            onClick={() =>
              setRows((prev) => prev.filter((r) => r.id !== row.id))
            }
            className="shrink-0 mt-1 text-puzzle-red"
          >
            <X size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { id: newId(), value: "" }])}
        className="flex items-center gap-1 text-xs font-bold uppercase self-start"
      >
        <Plus size={14} /> Add bullet
      </button>
    </div>
  );
}
