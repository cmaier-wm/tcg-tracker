import { z } from "zod";
import { isSafeReturnToPath } from "@/lib/auth/auth-config";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .transform((value) => normalizeEmail(value));

const returnToSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    if (!value || !isSafeReturnToPath(value)) {
      return null;
    }

    return value;
  });

export const registerRequestSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters."),
  returnTo: returnToSchema
});

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
  returnTo: returnToSchema
});

export const authSessionResponseSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  returnTo: z.string().nullable()
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type AuthSessionResponse = z.infer<typeof authSessionResponseSchema>;
