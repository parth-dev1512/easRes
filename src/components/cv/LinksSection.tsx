"use client";

import { useRef, useState, useTransition } from "react";
import { Share2, X } from "lucide-react";
import { PuzzleTag } from "@/components/puzzle/PuzzleTag";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { createLink, deleteLink } from "@/app/(protected)/cv/actions";
import type { Link as CvLink } from "@/lib/types/cv";

export function LinksSection({ links: initialLinks }: { links: CvLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleDelete(linkId: string) {
    const snapshot = links;
    setLinks((l) => l.filter((lk) => lk.id !== linkId));
    deleteLink(linkId).catch(() => setLinks(snapshot));
  }

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const row = await createLink(formData);
      setLinks((l) => [...l, row as CvLink]);
    });
    formRef.current?.reset();
  }

  return (
    <section className="flex flex-col gap-4">
      <PuzzleTag
        icon={Share2}
        title={"Social\nLinks"}
        subtitle="Web Presence & Profiles"
        color="pink"
        className="w-fit"
      />
      <PuzzleCard className="bg-white p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between border-2 border-black px-3 h-10 text-sm"
            >
              <span>
                <span className="font-bold">{link.label}:</span> {link.url}
              </span>
              <button
                type="button"
                aria-label="Remove link"
                onClick={() => handleDelete(link.id)}
                className="text-puzzle-red"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <form
          ref={formRef}
          action={handleCreate}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            name="label"
            required
            placeholder="Label (e.g. LinkedIn)"
            className="border-2 border-black px-3 h-10 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
          />
          <input
            type="text"
            name="url"
            required
            placeholder="URL"
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
