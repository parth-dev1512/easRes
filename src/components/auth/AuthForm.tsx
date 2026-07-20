"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import type { AuthFormState } from "@/lib/types/auth";

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: (
    prevState: AuthFormState,
    formData: FormData
  ) => Promise<AuthFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isLogin = mode === "login";

  return (
    <PuzzleCard className="bg-white w-full max-w-sm p-8 flex flex-col gap-6">
      <h1 className="text-3xl font-[900] uppercase italic tracking-tighter">
        {isLogin ? "Log In" : "Sign Up"}
      </h1>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="border-2 border-black px-3 h-11 focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider">
            Password
          </span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="border-2 border-black px-3 h-11 focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
          />
        </label>

        {state?.error && (
          <p className="text-sm font-medium text-puzzle-red">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-sm font-medium text-puzzle-green">
            {state.success}
          </p>
        )}

        <BlueprintButton
          type="submit"
          variant="primary"
          disabled={pending}
          className="w-full mt-2"
        >
          {pending ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
        </BlueprintButton>
      </form>

      <p className="text-sm text-center text-slate-600">
        {isLogin ? (
          <>
            No account?{" "}
            <Link href="/signup" className="font-bold underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-bold underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </PuzzleCard>
  );
}
