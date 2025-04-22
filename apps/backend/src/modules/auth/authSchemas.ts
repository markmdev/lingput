import { z } from "zod";

export const userCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
