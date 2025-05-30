import { z } from "zod";
// We're using the interface structures from tracking.ts but implementing them as Zod schemas

// Create Zod schemas from the TypeScript interfaces
const FocusLostEventSchema = z.object({
    timestamp: z.number(),
    duration_ms: z.number()
});

const ClipboardEventSchema = z.object({
    timestamp: z.number(),
    type: z.enum(["copy", "paste", "cut"]),
    content: z.string()
});

const AnswerChangeEventSchema = z.object({
    question_id: z.number(),
    previous_answer: z.string(),
    new_answer: z.string(),
    timestamp: z.number(),
    input_type: z.string()
});

const MouseClickEventSchema = z.object({
    timestamp: z.number(),
    button: z.string(),
    x: z.number(),
    y: z.number(),
    target: z.string()
});

const KeyboardPressEventSchema = z.object({
    timestamp: z.number(),
    keyType: z.string()
});

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

    // Timestamp fields
    start_time: z.string().optional().transform((val) => val ? new Date(val) : null),
    submit_time: z.string().optional().transform((val) => val ? new Date(val) : null),

    // New tracking fields - all optional and only validated if present
    focus_lost_events: z.array(FocusLostEventSchema).optional(),
    clipboard_events: z.array(ClipboardEventSchema).optional(),
    pre_submit_delay: z.number().optional(),
    answer_change_events: z.array(AnswerChangeEventSchema).optional(),
    device_fingerprint: z.object({}).passthrough().optional(),
    device_type: z.enum(["desktop", "mobile", "tablet"]).optional().default("desktop"),
    time_to_first_interaction: z.number().optional(),
    mouse_click_events: z.array(MouseClickEventSchema).optional(),
    keyboard_press_events: z.array(KeyboardPressEventSchema).optional()
});

export type AnswerInput = z.infer<typeof AnswerSchema>;