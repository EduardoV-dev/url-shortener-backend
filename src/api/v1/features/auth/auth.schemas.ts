import { z } from "zod";

export const authLoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, { message: "Email cannot be empty" })
    .email({ message: "Invalid email format" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(128, { message: "Password must be at most 128 characters long" }),
});

export const authCreationSchema = authLoginSchema
  .extend({
    confirmPassword: z
      .string({ required_error: "Confirm Password is required" })
      .min(8, { message: "Confirm Password must be at least 8 characters long" })
      .max(128, { message: "Confirm Password must be at most 128 characters long" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AuthSchema = z.infer<typeof authLoginSchema>;
