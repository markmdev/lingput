import { z } from "zod";

export const storySubjectSchema = z.string().max(50, "Maximum subject length is 50 characters");

export const storySubjectRequestSchema = z.object({
  subject: storySubjectSchema.optional(),
});
