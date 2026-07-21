"use client";

import { useActionState, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { updateProfile } from "@/app/(protected)/cv/actions";
import type { Profile } from "@/lib/types/cv";

async function action(_prevState: unknown, formData: FormData) {
  await updateProfile(formData);
  return { saved: true };
}

export function PersonalInfoSection({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [open, setOpen] = useState(true);

  return (
    <section className="flex flex-col gap-4 lg:-mx-24 lg:w-[calc(100%+12rem)] xl:-mx-40 xl:w-[calc(100%+20rem)]">
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-[900] uppercase italic tracking-tighter">
          Personal Info
        </h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle personal info"
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
      <PuzzleCard className="bg-white p-6">
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Full Name
              </span>
              <input
                type="text"
                name="full_name"
                defaultValue={profile.full_name ?? ""}
                className="border-2 border-black px-2 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Headline
              </span>
              <input
                type="text"
                name="headline"
                defaultValue={profile.headline ?? ""}
                className="border-2 border-black px-2 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Phone
              </span>
              <input
                type="text"
                name="phone"
                defaultValue={profile.phone ?? ""}
                className="border-2 border-black px-2 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Location
              </span>
              <input
                type="text"
                name="location"
                defaultValue={profile.location ?? ""}
                className="border-2 border-black px-2 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
              />
            </label>
            <label className="sm:col-span-2 lg:col-span-3 flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Website / Portfolio URL
              </span>
              <input
                type="text"
                name="website_url"
                defaultValue={profile.website_url ?? ""}
                className="border-2 border-black px-2 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
              />
            </label>
            <label className="sm:col-span-2 lg:col-span-3 flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Summary
              </span>
              <textarea
                name="summary"
                rows={4}
                defaultValue={profile.summary ?? ""}
                className="border-2 border-black px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
              />
            </label>
          </div>
          <div className="flex items-center justify-between">
            {state?.saved && (
              <span className="text-sm font-medium text-puzzle-green">
                Saved.
              </span>
            )}
            <BlueprintButton
              type="submit"
              variant="primary"
              className="px-6 h-10 ml-auto"
              disabled={pending}
            >
              Save
            </BlueprintButton>
          </div>
        </form>
      </PuzzleCard>
      )}
    </section>
  );
}
