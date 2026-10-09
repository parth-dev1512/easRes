"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import { BlueprintButton } from "@/components/puzzle/BlueprintButton";
import { signInWithGoogle } from "@/app/(auth)/actions";
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
        {!isLogin && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Full Name
              </span>
              <input
                type="text"
                name="full_name"
                required
                autoComplete="name"
                className="border-2 border-black px-3 h-11 focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Phone Number
              </span>
              <input
                type="tel"
                name="phone"
                required
                autoComplete="tel"
                className="border-2 border-black px-3 h-11 focus:outline-none focus:ring-2 focus:ring-puzzle-blue"
              />
            </label>
          </>
        )}

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
            {state.error}{" "}
            {state.accountExists && (
              <Link href="/login" className="underline">
                Log in instead.
              </Link>
            )}
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
          loading={pending}
          className="w-full mt-2"
        >
          {pending ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
        </BlueprintButton>
      </form>

      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-500">
        <span className="flex-1 border-t-2 border-black/20" />
        or
        <span className="flex-1 border-t-2 border-black/20" />
      </div>

      <form action={signInWithGoogle}>
        <BlueprintButton type="submit" variant="secondary" className="w-full">
          <span className="flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
              <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
            </svg>
            Continue with Google
          </span>
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
