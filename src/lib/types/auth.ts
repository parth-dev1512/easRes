import { z } from "zod";

export const AuthSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export type AuthFormState =
  | { error: string; success?: never }
  | { success: string; error?: never }
  | undefined;
