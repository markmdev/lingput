import { ZodIssue, ZodSchema } from "zod";
import { BadRequestError } from "@/errors/BadRequestError";

export const validateData = <T>(schema: ZodSchema<T>, data: any): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new BadRequestError("Invalid data", result.error.errors);
  }

  return result.data;
};
