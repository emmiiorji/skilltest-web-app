import { z } from "zod";

export const AnswerSchema = z.object({
    test_id: z.number().int().positive(),
    question_id: z.number().int().positive(),
    profile_id: z.number().int().positive(),
    answer: z.string().min(1, "Answer is required"),
    user_agent: z.string().max(255),
    ip: z.string().ip(),
    copypaste: z.enum(["copy", "paste", "right click"]).nullable(),
    inactive: z.boolean(),
    is_correct: z.boolean().nullable(),
});

export type AnswerInput = z.infer<typeof AnswerSchema>;