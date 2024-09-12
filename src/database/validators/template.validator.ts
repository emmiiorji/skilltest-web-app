import { z } from "zod";

export const templateSchema = z.object({
  template: z.string(),
});

export type TemplateInput = z.infer<typeof templateSchema>;