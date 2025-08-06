import { z } from "zod";

export const authCreationSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .min(1, { message: "Email cannot be empty" })
      .email({ message: "Invalid email format" }),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(128, { message: "Password must be at most 128 characters long" }),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(8, { message: "Confirm password must be at least 8 characters long" })
      .max(128, { message: "Confirm password must be at most 128 characters long" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AuthCreationSchema = Omit<z.infer<typeof authCreationSchema>, "confirmPassword">;
