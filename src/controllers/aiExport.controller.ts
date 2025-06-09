import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { connection } from '../database/connection';
import { convertAnswerToArray } from '../utils/convertAnswerToArray';
import {
  Answer,
  AnswerChangeEvent,
  FocusLostEvent,
  FocusEvent,
  MouseClickEvent,
  KeyboardPressEvent,
  MathTestSummary,
  JavaScriptTestSummary,
  ClipboardEvent
} from '../types/tracking';

// Utility function to format timestamps to readable format
function formatTimestamp(timestamp: number | Date | string | null | undefined): string | null {
  if (!timestamp) return null;

  let date: Date;
  if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }

  // Format as "YYYY-MM-DD H:mm:ss.SSS"
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export function aiExportController(app: FastifyInstance, _opts: any, done: () => void) {

  app.get('/math-json', async (request, reply) => {
    try {
      // Check if user_id exists and is not empty
      const query = request.query as { user_id?: string, test_id?: string, key?: string };

      if (!query.user_id) {
        return reply.status(400).send({
          ok: false,
          error: "User ID is required and cannot be empty"
        });
      }

      let userLinkId: string;
      let test_id: number;
      let _key: string;

      try {
        const validatedData = z.object({
          user_id: z.string().min(1, "User ID cannot be empty"),
          test_id: z.coerce.number(),
          key: z.string()
        }).parse(request.query);

        userLinkId = validatedData.user_id;
        test_id = validatedData.test_id;
        _key = validatedData.key;
      } catch (validationError) {
        request.log.error(validationError, "Validation error in math-json endpoint");
        return reply.status(400).send({
          ok: false,
          error: validationError instanceof z.ZodError
            ? validationError.errors.map(e => `${e.path}: ${e.message}`).join(', ')
            : 'Invalid request parameters'
        });
      }

      const dataSource = await connection();

      // Fetch user data
      const user = await dataSource.query(`
        SELECT name, link FROM profile WHERE link = ?
      `, [userLinkId]);

      if (!user || user.length === 0) {
        return reply.status(404).send({ ok: false, error: `User with link '${userLinkId}' not found` });
      }

      // Fetch test data with test_start_time from tests_profiles
      const test = await dataSource.query(`
        SELECT t.id, t.name, t.createdAt, tp.test_start_time
        FROM tests t
        LEFT JOIN tests_profiles tp ON t.id = tp.testId AND tp.profileId = (SELECT id FROM profile WHERE link = ?)
        WHERE t.id = ?
      `, [userLinkId, test_id]);

      if (!test || test.length === 0) {
        return reply.status(404).send({ ok: false, error: `Test with ID ${test_id} not found` });
      }

    // Fetch answers with questions
    const answers = await dataSource.query(`
      SELECT
        a.*,
        q.question,
        q.correct
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.profile_id = (SELECT id FROM profile WHERE link = ?)
      AND a.test_id = ?
      ORDER BY a.created_at ASC
    `, [userLinkId, test_id]);

    // Get device info from first answer
    const deviceInfo = answers.length > 0 ? {
      device_type: answers[0].device_type,
      user_agent: answers[0].user_agent,
      ip: answers[0].ip,
      fingerprint: answers[0].device_fingerprint || {}
    } : {};

    // Format questions data - only include tracking fields that were actually tracked
    const questions = answers.map((a: Answer) => {
      const correctAnswersArray = convertAnswerToArray(a.correct || '');
      const correctAnswer = correctAnswersArray.join(' OR ');

      const questionData: any = {
        id: a.question_id,
        user_answer: a.answer,
        correct_answer: correctAnswer,
        is_correct: a.is_correct,
        time_taken: a.time_taken,
        inactive_time: a.inactive_time,
        copy_count: a.copy_count,
        paste_count: a.paste_count,
        right_click_count: a.right_click_count,
        start_time: formatTimestamp(a.start_time),
        submit_time: formatTimestamp(a.submit_time)
      };

      // Only include tracking fields that have data (were enabled during test)
      if (a.pre_submit_delay !== undefined && a.pre_submit_delay !== null) {
        questionData.pre_submit_delay = a.pre_submit_delay;
      }

      if (a.time_to_first_interaction !== undefined && a.time_to_first_interaction !== null) {
        questionData.time_to_first_interaction = a.time_to_first_interaction;
      }

      if (a.clipboard_events && a.clipboard_events.length > 0) {
        // Format timestamps
        questionData.clipboard_events = a.clipboard_events.map((event: ClipboardEvent) => ({
          ...event,
          timestamp: formatTimestamp(event.timestamp)
        }));
      }

      if (a.answer_change_events && a.answer_change_events.length > 0) {
        questionData.answer_changes = a.answer_change_events.map((event: AnswerChangeEvent) => ({
          ...event,
          timestamp: formatTimestamp(event.timestamp)
        }));
      }

      // Handle focus events
      if (a.focus_events && a.focus_events.length > 0) {
        // Format timestamps
        questionData.focus_events = a.focus_events.map((event: FocusEvent) => ({
          ...event,
          timestamp: formatTimestamp(event.timestamp)
        }));
      }

      if (a.mouse_click_events && a.mouse_click_events.length > 0) {
        // Format timestamps
        questionData.mouse_click_events = a.mouse_click_events.map((event: MouseClickEvent) => ({
          ...event,
          timestamp: formatTimestamp(event.timestamp)
        }));
      }

      if (a.keyboard_press_events && a.keyboard_press_events.length > 0) {
        // Format timestamps
        questionData.keyboard_press_events = a.keyboard_press_events.map((event: KeyboardPressEvent) => ({
          ...event,
          timestamp: formatTimestamp(event.timestamp)
        }));
      }

      return questionData;
    });


    // Calculate summary - handle conditional tracking data
    const summary: MathTestSummary = {
      total_questions: questions.length,
      correct_answers: questions.filter((q: { is_correct: boolean }) => q.is_correct).length,
      score_percentage: Math.round((questions.filter((q: { is_correct: boolean }) => q.is_correct).length / questions.length) * 100),
      total_time: questions.reduce((sum: number, q: { time_taken: number }) => sum + q.time_taken, 0),
      total_inactive_time: questions.reduce((sum: number, q: { inactive_time: number }) => sum + q.inactive_time, 0),
      average_time_per_question: Math.round(questions.reduce((sum: number, q: { time_taken: number }) => sum + q.time_taken, 0) / questions.length),
      total_copy_actions: questions.reduce((sum: number, q: { copy_count: number }) => sum + q.copy_count, 0),
      total_paste_actions: questions.reduce((sum: number, q: { paste_count: number }) => sum + q.paste_count, 0),
      total_right_click_actions: questions.reduce((sum: number, q: { right_click_count: number }) => sum + q.right_click_count, 0)
    };

    // Only include tracking metrics in summary if they were tracked
    const questionsWithFocusEvents = questions.filter((q: any) => q.focus_events);
    if (questionsWithFocusEvents.length > 0) {
      // Calculate focus lost metrics from focus_events with type "inactive"
      summary.total_focus_lost_count = questionsWithFocusEvents.reduce((sum: number, q: any) =>
        sum + q.focus_events.filter((e: any) => e.type === "inactive").length, 0);
      summary.total_focus_lost_duration = questionsWithFocusEvents.reduce((sum: number, q: any) =>
        sum + q.focus_events
          .filter((e: any) => e.type === "inactive")
          .reduce((s: number, e: any) => s + e.duration_ms, 0), 0);
    }

    const questionsWithAnswerChanges = questions.filter((q: any) => q.answer_changes);
    if (questionsWithAnswerChanges.length > 0) {
      summary.total_answer_changes = questionsWithAnswerChanges.reduce((sum: number, q: any) => sum + q.answer_changes.length, 0);
      summary.questions_without_changes = questions.filter((q: any) => !q.answer_changes || q.answer_changes.length === 0).length;
      summary.questions_with_multiple_attempts = questionsWithAnswerChanges.filter((q: any) => q.answer_changes.length > 0).length;
    }

    const questionsWithMouseEvents = questions.filter((q: any) => q.mouse_click_events);
    if (questionsWithMouseEvents.length > 0) {
      summary.total_mouse_clicks = questionsWithMouseEvents.reduce((sum: number, q: any) => sum + q.mouse_click_events.length, 0);
    }

    const questionsWithKeyboardEvents = questions.filter((q: any) => q.keyboard_press_events);
    if (questionsWithKeyboardEvents.length > 0) {
      summary.total_keyboard_presses = questionsWithKeyboardEvents.reduce((sum: number, q: any) => sum + q.keyboard_press_events.length, 0);
    }

    // Calculate completed_at as the latest submit_time from answers
    const completedAt = answers.length > 0
      ? answers.reduce((latest: Date | null, answer: any) => {
          if (!answer.submit_time) return latest;
          const submitTime = new Date(answer.submit_time);
          return !latest || submitTime > latest ? submitTime : latest;
        }, null)
      : null;

    const result = {
      user: {
        name: user[0].name,
        link: user[0].link
      },
      test: {
        id: test[0].id,
        name: test[0].name,
        created_at: formatTimestamp(test[0].createdAt),
        completed_at: formatTimestamp(completedAt),
        test_start_time: formatTimestamp(test[0].test_start_time)
      },
      device_info: deviceInfo,
      questions: questions,
      summary: summary
    };

    return reply.send(result);
    } catch (error) {
      request.log.error(error, "Error generating math JSON export");

      // Handle different types of errors
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          ok: false,
          error: error.errors.map(e => `${e.path}: ${e.message}`).join(', ')
        });
      } else if (error instanceof Error) {
        return reply.status(500).send({
          ok: false,
          error: error.message
        });
      } else {
        return reply.status(500).send({
          ok: false,
          error: 'An unknown error occurred'
        });
      }
    }
  });

  app.get('/js-json', async (request, reply) => {
    try {
      const query = request.query as { user_id?: string, test_id?: string, key?: string };

      if (!query.user_id) {
        return reply.status(400).send({
          ok: false,
          error: "User ID is required and cannot be empty"
        });
      }

      let userLinkId: string;
      let test_id: number;
      let _key: string;

      try {
        const validatedData = z.object({
          user_id: z.string().min(1, "User ID cannot be empty"),
          test_id: z.coerce.number(),
          key: z.string()
        }).parse(request.query);

        userLinkId = validatedData.user_id;
        test_id = validatedData.test_id;
        _key = validatedData.key;
      } catch (validationError) {
        request.log.error(validationError, "Validation error in js-json endpoint");
        return reply.status(400).send({
          ok: false,
          error: validationError instanceof z.ZodError
            ? validationError.errors.map(e => `${e.path}: ${e.message}`).join(', ')
            : 'Invalid request parameters'
        });
      }

      const dataSource = await connection();

      const user = await dataSource.query(`
        SELECT name, link FROM profile WHERE link = ?
      `, [userLinkId]);

      if (!user || user.length === 0) {
        return reply.status(404).send({ ok: false, error: `User with link '${userLinkId}' not found` });
      }

      const test = await dataSource.query(`
        SELECT t.id, t.name, t.createdAt, tp.test_start_time
        FROM tests t
        LEFT JOIN tests_profiles tp ON t.id = tp.testId AND tp.profileId = (SELECT id FROM profile WHERE link = ?)
        WHERE t.id = ?
      `, [userLinkId, test_id]);

      if (!test || test.length === 0) {
        return reply.status(404).send({ ok: false, error: `Test with ID ${test_id} not found` });
      }

    const answers = await dataSource.query(`
      SELECT
        a.*,
        q.question
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.profile_id = (SELECT id FROM profile WHERE link = ?)
      AND a.test_id = ?
      ORDER BY a.created_at ASC
    `, [userLinkId, test_id]);

    const deviceInfo = answers.length > 0 ? {
      device_type: answers[0].device_type,
      user_agent: answers[0].user_agent,
      ip: answers[0].ip
    } : {};

    const questions = answers.map((a: Answer) => {
      const questionData: any = {
        id: a.question_id,
        user_answer: a.answer,
        time_taken: a.time_taken,
        inactive_time: a.inactive_time,
        answer_length: a.answer.length,
        word_count: a.answer.split(/\s+/).filter((word: string) => word.length > 0).length,
        start_time: formatTimestamp(a.start_time),
        submit_time: formatTimestamp(a.submit_time)
      };

      // Handle focus events - support both old and new formats
      if (a.focus_events && a.focus_events.length > 0) {
        questionData.focus_events = a.focus_events.map((event: FocusEvent) => ({
          ...event,
          timestamp: formatTimestamp(event.timestamp)
        }));
      } else if (a.focus_lost_events && a.focus_lost_events.length > 0) {
        // Convert old focus_lost_events to new format for backward compatibility
        questionData.focus_events = a.focus_lost_events.map((event: FocusLostEvent) => ({
          timestamp: formatTimestamp(event.timestamp),
          duration_ms: event.duration_ms,
          type: "inactive" as const
        }));
      }

      return questionData;
    });

    const summary: JavaScriptTestSummary = {
      total_questions: questions.length,
      total_time: questions.reduce((sum: number, q: { time_taken: number }) => sum + q.time_taken, 0),
      total_inactive_time: questions.reduce((sum: number, q: { inactive_time: number }) => sum + q.inactive_time, 0),
      average_time_per_question: Math.round(questions.reduce((sum: number, q: { time_taken: number }) => sum + q.time_taken, 0) / questions.length),
      average_answer_length: Math.round(questions.reduce((sum: number, q: { answer_length: number }) => sum + q.answer_length, 0) / questions.length),
      average_word_count: Math.round(questions.reduce((sum: number, q: { word_count: number }) => sum + q.word_count, 0) / questions.length)
    };

    // Only include focus tracking metrics if they were tracked
    const questionsWithFocusEvents = questions.filter((q: any) => q.focus_events);
    if (questionsWithFocusEvents.length > 0) {
      // Calculate focus lost metrics from focus_events with type "inactive"
      summary.total_focus_lost_count = questionsWithFocusEvents.reduce((sum: number, q: any) =>
        sum + q.focus_events.filter((e: any) => e.type === "inactive").length, 0);
      summary.total_focus_lost_duration = questionsWithFocusEvents.reduce((sum: number, q: any) =>
        sum + q.focus_events
          .filter((e: any) => e.type === "inactive")
          .reduce((s: number, e: any) => s + e.duration_ms, 0), 0);
    }

    // Calculate completed_at as the latest submit_time from answers
    const completedAt = answers.length > 0
      ? answers.reduce((latest: Date | null, answer: any) => {
          if (!answer.submit_time) return latest;
          const submitTime = new Date(answer.submit_time);
          return !latest || submitTime > latest ? submitTime : latest;
        }, null)
      : null;

    const result = {
      user: {
        name: user[0].name,
        link: user[0].link
      },
      test: {
        id: test[0].id,
        name: test[0].name,
        created_at: formatTimestamp(test[0].createdAt),
        completed_at: formatTimestamp(completedAt),
        test_start_time: formatTimestamp(test[0].test_start_time)
      },
      device_info: deviceInfo,
      questions: questions,
      summary: summary
    };

    return reply.send(result);
    } catch (error) {
      request.log.error(error, "Error generating JS JSON export");

      // Handle different types of errors
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          ok: false,
          error: error.errors.map(e => `${e.path}: ${e.message}`).join(', ')
        });
      } else if (error instanceof Error) {
        return reply.status(500).send({
          ok: false,
          error: error.message
        });
      } else {
        return reply.status(500).send({
          ok: false,
          error: 'An unknown error occurred'
        });
      }
    }
  });

  done();
}
