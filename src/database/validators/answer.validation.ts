import { z } from "zod";

export const AnswerSchema = z.object({
    test_id: z.coerce.number().int().positive(),
    question_id: z.coerce.number().int().positive(),
    profile_id: z.coerce.number().int().positive(),
    answer: z.string().min(1, "Answer is required"),
    time_taken: z.coerce.number().int().positive(),
    ip: z.string().optional(),
    copy_count: z.coerce.number().int().nonnegative(),
    paste_count: z.coerce.number().int().nonnegative(),
    right_click_count: z.coerce.number().int().nonnegative(),
    inactive_time: z.coerce.number().int().nonnegative(),

    focus_lost_events: z.array(z.object({
        timestamp: z.number(),
        duration_ms: z.number()
    })).optional().default([]),
    clipboard_events: z.array(z.object({
        timestamp: z.number(),
        type: z.enum(["copy", "paste", "cut"]),
        content: z.string()
    })).optional().default([]),
    pre_submit_delay: z.number().optional().default(0),
    answer_change_events: z.array(z.object({
        question_id: z.number(),
        previous_answer: z.string(),
        new_answer: z.string(),
        timestamp: z.number(),
        input_type: z.string()
    })).optional().default([]),
    device_fingerprint: z.object({}).passthrough().optional().default({}),
    device_type: z.enum(["desktop", "mobile", "tablet"]).optional().default("desktop"),
    time_to_first_interaction: z.number().optional().default(0),
    mouse_click_events: z.array(z.object({
        timestamp: z.number(),
        button: z.string(),
        x: z.number(),
        y: z.number(),
        target: z.string()
    })).optional().default([]),
    keyboard_press_events: z.array(z.object({
        timestamp: z.number(),
        keyType: z.string()
    })).optional().default([])
});

export type AnswerInput = z.infer<typeof AnswerSchema>;