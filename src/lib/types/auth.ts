import { z } from "zod";

export const AuthSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export const SignupSchema = AuthSchema.extend({
  full_name: z.string().trim().min(1, { message: "Enter your name." }).max(200),
  phone: z.string().trim().min(1, { message: "Enter your phone number." }).max(50),
});

export type AuthFormState =
  | { error: string; accountExists?: boolean; success?: never }
  | { success: string; error?: never; accountExists?: never }
  | undefined;
