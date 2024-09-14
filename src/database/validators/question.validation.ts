import { z } from "zod";

export const QuestionSchema = z.object({
    question: z.string().min(1, "Question is required"),
    answer_type: z.enum(["textarea", "radiobutton", "multiinput"]),
    answer_html: z.string().min(1, "Answer HTML is required"),
    correct: z.string().min(1, "Correct answer is required"),
});

export type QuestionInput = z.infer<typeof QuestionSchema>;