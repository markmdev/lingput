import { z } from "zod";

export const storySubjectSchema = z.string().max(50, "Maximum topic length is 50 characters").min(2, "Minimum topic length is 2 characters");

export const storySubjectRequestSchema = z.object({
  subject: storySubjectSchema.optional(),
});
