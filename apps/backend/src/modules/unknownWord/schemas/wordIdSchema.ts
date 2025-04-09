import { z } from "zod";

export const wordIdSchema = z.coerce.number().gt(0);

export const wordIdRequestSchema = z.object({
  wordId: wordIdSchema,
});
