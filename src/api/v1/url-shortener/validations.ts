import { z } from "zod";

export const urlSchema = z.object({
  url: z
    .string({ required_error: "URL is required" })
    .min(1, "URL is empty")
    .url({ message: "Provided URL is not a valid URL" }),
});
