/**
 * Tracking event interfaces for user behavior tracking
 * These interfaces define the structure of events tracked during test taking
 */

/**
 * Event triggered when a user changes their answer
 */
export interface AnswerChangeEvent {
    question_id: number;
    previous_answer: string;
    new_answer: string;
    timestamp: number;
    input_type: string;
}

/**
 * Event triggered when user loses focus on the test window
 */
export interface FocusLostEvent {
    timestamp: number;
    duration_ms: number;
}

/**
 * Event triggered when user clicks the mouse
 */
export interface MouseClickEvent {
    timestamp: number;
    button: string;
    x: number;
    y: number;
    target: string;
}

/**
 * Event triggered when user presses a key
 */
export interface KeyboardPressEvent {
    timestamp: number;
    keyType: string;
}

/**
 * Event triggered for clipboard operations (copy/paste/cut)
 */
export interface ClipboardEvent {
    timestamp: number;
    type: "copy" | "paste" | "cut";
    content: string;
}

/**
 * Answer data structure including tracking events
 */
export interface Answer {
    question_id: number;
    question: string;
    answer: string;
    correct: string;
    is_correct: boolean;
    time_taken: number;
    inactive_time: number;
    pre_submit_delay?: number;
    time_to_first_interaction?: number;
    copy_count: number;
    paste_count: number;
    right_click_count: number;
    clipboard_events?: ClipboardEvent[];
    answer_change_events?: AnswerChangeEvent[];
    focus_lost_events?: FocusLostEvent[];
    mouse_click_events?: MouseClickEvent[];
    keyboard_press_events?: KeyboardPressEvent[];
}

/**
 * Tracking configuration options
 */
export interface TrackingConfig {
    disableFocusLostEvents?: boolean;
    disableMouseClickEvents?: boolean;
    disableKeyboardPressEvents?: boolean;
    disableDeviceFingerprint?: boolean;
    disableClipboardEvents?: boolean;
    disableAnswerChangeEvents?: boolean;
    disablePreSubmitDelay?: boolean;
    disableTimeToFirstInteraction?: boolean;
}
