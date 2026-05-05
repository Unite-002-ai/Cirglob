import { z } from "zod";

/**
 * =========================
 * AUTH VALIDATION SCHEMAS
 * =========================
 */

/**
 * SIGN UP VALIDATION
 * Matches Supabase signUp + profiles table
 */
export const signUpSchema = z.object({
  email: z.string().email("Invalid email format").max(255),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),

  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
});

/**
 * SIGN IN VALIDATION
 */
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * RESET PASSWORD VALIDATION
 */
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
});

/**
 * =========================
 * PROFILE VALIDATION
 * (matches Supabase profiles table)
 * =========================
 */

export const userRoleSchema = z.enum([
  "FOUNDER",
  "INVESTOR",
  "ADMIN",
]);

export const profileUpdateSchema = z.object({
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  role: userRoleSchema.optional(),
  avatar_url: z.string().url().optional(),
});

/**
 * =========================
 * APPLICATION VALIDATION
 * (matches applications table)
 * =========================
 */

export const applicationSchema = z.object({
  role_applied: z.string().min(2).max(100),

  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),

  email: z.string().email(),

  linkedin: z.string().url().optional(),
  location: z.string().max(100).optional(),
  portfolio: z.string().url().optional(),

  resume_url: z.string().url().optional(),

  motivation: z.string().min(10).max(2000),

  status: z
    .enum(["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"])
    .optional(),
});

/**
 * =========================
 * SAFE PARSERS (production helpers)
 * =========================
 */

export function validateSignUp(data: unknown) {
  return signUpSchema.safeParse(data);
}

export function validateSignIn(data: unknown) {
  return signInSchema.safeParse(data);
}

export function validateResetPassword(data: unknown) {
  return resetPasswordSchema.safeParse(data);
}

export function validateProfileUpdate(data: unknown) {
  return profileUpdateSchema.safeParse(data);
}

export function validateApplication(data: unknown) {
  return applicationSchema.safeParse(data);
}

/**
 * =========================
 * SECURITY UTILITIES
 * =========================
 */

/**
 * Sanitize strings (prevents accidental injection / malformed data)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[<>]/g, "");
}

/**
 * Normalize email (critical for Supabase auth consistency)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * =========================
 * ROLE SAFETY GUARDS
 * =========================
 */

export function isValidRole(role: string): role is z.infer<typeof userRoleSchema> {
  return userRoleSchema.safeParse(role).success;
}

/**
 * Prevent privilege escalation (IMPORTANT for Supabase RLS safety)
 */
export function isAdminRole(role?: string | null): boolean {
  return role === "ADMIN";
}