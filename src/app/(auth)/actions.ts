"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUserId } from "@/lib/data/crud";
import { AuthSchema, SignupSchema, type AuthFormState } from "@/lib/types/auth";

// Marks this browser as belonging to someone with an account, so the
// landing page can offer "Enter" instead of "Get Started" on return
// visits, even after they log out. Not a security check.
async function markDeviceAsRegistered() {
  (await cookies()).set("has_account", "1", {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = AuthSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: error.message };
  }

  await markDeviceAsRegistered();
  redirect("/dashboard");
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = SignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) {
    return { error: error.message };
  }

  // Supabase doesn't return an error for an email that's already registered
  // (avoids leaking which emails have accounts) — instead it returns a user
  // object with an empty `identities` array and no error. That's the
  // documented signal to check for.
  if (data.user && data.user.identities?.length === 0) {
    return {
      error: "You already have an account with this email.",
      accountExists: true,
    };
  }

  await markDeviceAsRegistered();
  return { success: "Check your email to confirm your account." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function deleteAccount() {
  const userId = await requireUserId();

  // profiles/education/experience/... all reference auth.users with
  // ON DELETE CASCADE, so deleting the auth user removes everything else.
  const { error } = await createAdminClient().auth.admin.deleteUser(userId);
  if (error) throw error;

  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete("has_account");

  redirect("/");
}
