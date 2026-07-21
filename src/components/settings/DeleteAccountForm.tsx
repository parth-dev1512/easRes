"use client";

import { useState, useTransition } from "react";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { deleteAccount } from "@/app/(auth)/actions";

const CONFIRM_TEXT = "DELETE";

export function DeleteAccountForm() {
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const canDelete = confirmText === CONFIRM_TEXT;

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-wider">
          Type {CONFIRM_TEXT} to confirm
        </span>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
          className="border-2 border-black px-3 h-11 focus:outline-none focus:ring-2 focus:ring-puzzle-red"
        />
      </label>
      <BlueprintButton
        type="button"
        variant="secondary"
        className="w-full border-puzzle-red text-puzzle-red hover:bg-puzzle-red hover:text-white"
        disabled={!canDelete || isPending}
        onClick={() => startTransition(() => deleteAccount())}
      >
        {isPending ? "Deleting..." : "Delete Account"}
      </BlueprintButton>
    </div>
  );
}
