import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name."),
  lastName: z.string().trim().min(1, "Enter your last name."),
  email: z
    .string()
    .trim()
    .pipe(z.email("Enter a valid email address.")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

export type RegisterSchema = z.infer<typeof registerSchema>;