import { z } from "zod";

export const testSchema = z.object({
  name: z.string(),
});

export type TestInput = z.infer<typeof testSchema>;