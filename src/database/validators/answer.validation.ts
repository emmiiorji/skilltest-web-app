import { z } from "zod";

export const AnswerSchema = z.object({
    test_id: z.coerce.number().int().positive(),
    question_id: z.coerce.number().int().positive(),
    profile_id: z.coerce.number().int().positive(),
    answer: z.string().min(1, "Answer is required"),
    time_taken: z.coerce.number().int().positive(),
    copy_count: z.coerce.number().int().nonnegative(),
    paste_count: z.coerce.number().int().nonnegative(),
    right_click_count: z.coerce.number().int().nonnegative(),
    inactive_time: z.coerce.number().int().nonnegative(),
});

export type AnswerInput = z.infer<typeof AnswerSchema>;