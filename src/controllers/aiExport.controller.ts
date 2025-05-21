import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { connection } from '../database/connection';
import { convertAnswerToArray } from '../utils/convertAnswerToArray';

export function aiExportController(app: FastifyInstance, opts: any, done: () => void) {
        interface AnswerChangeEvent {
        question_id: number;
        previous_answer: string;
        new_answer: string;
        timestamp: number;
        input_type: string;
    }

    interface FocusLostEvent {
        timestamp: number,
        duration_ms: number,
    }
    
    interface MouseClickEvent {
        timestamp: number,
        button: string,
        x: number,
        y: number,
        target: string,
    }

    interface KeyboardPressEvent {
        timestamp: number,
        keyType: string,
    }

    interface ClipboardEvent {
        timestamp: number,
        type: string,
        content: string,
    }

    interface Answer {
        question_id: number,
        question: string,
        answer: string,
        correct: string,
        is_correct: boolean,
        time_taken: number,
        inactive_time: number,
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

  app.get('/export/math-json', async (request, reply) => {
    const { user_id: userLinkId, test_id, key } = z.object({
      user_id: z.string(),
      test_id: z.coerce.number(),
      key: z.string()
    }).parse(request.query);

    const dataSource = await connection();
    
    // Fetch user data
    const user = await dataSource.query(`
      SELECT name, link FROM profile WHERE link = ?
    `, [userLinkId]);

    // Fetch test data
    const test = await dataSource.query(`
      SELECT id, name, created_at FROM tests WHERE id = ?
    `, [test_id]);

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

    // Format questions data
    const questions = answers.map((a: Answer) => {
      const correctAnswersArray = convertAnswerToArray(a.correct);
      const correctAnswer = correctAnswersArray.join(' OR ');
      
      return {
        id: a.question_id,
        question: a.question,
        user_answer: a.answer,
        correct_answer: correctAnswer,
        is_correct: a.is_correct,
        time_taken: a.time_taken,
        inactive_time: a.inactive_time,
        pre_submit_delay: a.pre_submit_delay || 0,
        time_to_first_interaction: a.time_to_first_interaction || 0,
        copy_count: a.copy_count,
        paste_count: a.paste_count,
        right_click_count: a.right_click_count,
        clipboard_events: a.clipboard_events || [],
        answer_changes: a.answer_change_events || [],
        focus_lost_events: a.focus_lost_events || [],
        mouse_click_events: a.mouse_click_events || [],
        keyboard_press_events: a.keyboard_press_events || []
      };
    });


    // Calculate summary
    const summary = {
      total_questions: questions.length,
      correct_answers: questions.filter((q: { is_correct: boolean }) => q.is_correct).length,
      score_percentage: Math.round((questions.filter((q: { is_correct: boolean }) => q.is_correct).length / questions.length) * 100),
      total_time: questions.reduce((sum: number, q: { time_taken: number }) => sum + q.time_taken, 0),
      total_inactive_time: questions.reduce((sum: number, q: { inactive_time: number }) => sum + q.inactive_time, 0),
      average_time_per_question: Math.round(questions.reduce((sum: number, q: { time_taken: number }) => sum + q.time_taken, 0) / questions.length),
      total_copy_actions: questions.reduce((sum: number, q: { copy_count: number }) => sum + q.copy_count, 0),
      total_paste_actions: questions.reduce((sum: number, q: { paste_count: number }) => sum + q.paste_count, 0),
      total_right_click_actions: questions.reduce((sum: number, q: { right_click_count: number }) => sum + q.right_click_count, 0),
      total_focus_lost_count: questions.reduce((sum: number, q: { focus_lost_events: FocusLostEvent[] }) => sum + q.focus_lost_events.length, 0),
      total_focus_lost_duration: questions.reduce((sum: number, q: { focus_lost_events: FocusLostEvent[] }) => 
        sum + q.focus_lost_events.reduce((s, e) => s + e.duration_ms, 0), 0),
      total_answer_changes: questions.reduce((sum: number, q: { answer_changes: AnswerChangeEvent[] }) => sum + q.answer_changes.length, 0),
      total_mouse_clicks: questions.reduce((sum: number, q: { mouse_click_events: MouseClickEvent[] }) => sum + q.mouse_click_events.length, 0),
      total_keyboard_presses: questions.reduce((sum: number, q: { keyboard_press_events: KeyboardPressEvent[] }) => sum + q.keyboard_press_events.length, 0),
      questions_without_changes: questions.filter((q: { answer_changes: AnswerChangeEvent[] }) => q.answer_changes.length === 0).length,
      questions_with_multiple_attempts: questions.filter((q: {  answer_changes: AnswerChangeEvent[] }) => q.answer_changes.length > 0).length
    };

    const result = {
      user: {
        name: user[0].name,
        link: user[0].link
      },
      test: {
        id: test[0].id,
        name: test[0].name,
        completed_at: test[0].created_at
      },
      device_info: deviceInfo,
      questions: questions,
      summary: summary
    };

    return reply.send(result);
  });

  app.get('/export/js-json', async (request, reply) => {
    const { user_id: userLinkId, test_id, key } = z.object({
      user_id: z.string(),
      test_id: z.coerce.number(),
      key: z.string()
    }).parse(request.query);

    const dataSource = await connection();
    
    // Similar queries for JS test but simpler response
    const user = await dataSource.query(`
      SELECT name, link FROM profile WHERE link = ?
    `, [userLinkId]);

    const test = await dataSource.query(`
      SELECT id, name, created_at FROM tests WHERE id = ?
    `, [test_id]);

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

    const questions = answers.map((a: Answer) => ({
      id: a.question_id,
      question: a.question,
      user_answer: a.answer,
      time_taken: a.time_taken,
      inactive_time: a.inactive_time,
      focus_lost_events: a.focus_lost_events || [],
      answer_length: a.answer.length,
      word_count: a.answer.split(/\s+/).filter((word: string) => word.length > 0).length
    }));

    const summary = {
      total_questions: questions.length,
      total_time: questions.reduce((sum: number, q: { time_taken: number }) => sum + q.time_taken, 0),
      total_inactive_time: questions.reduce((sum: number, q: { inactive_time: number }) => sum + q.inactive_time, 0),
      average_time_per_question: Math.round(questions.reduce((sum: number, q: { time_taken: number }) => sum + q.time_taken, 0) / questions.length),
      total_focus_lost_count: questions.reduce((sum: number, q: { focus_lost_events: FocusLostEvent[] }) => sum + q.focus_lost_events.length, 0),
      total_focus_lost_duration: questions.reduce((sum: number, q: { focus_lost_events: FocusLostEvent[] }) => 
        sum + q.focus_lost_events.reduce((s, e) => s + e.duration_ms, 0), 0),
      average_answer_length: Math.round(questions.reduce((sum: number, q: { answer_length: number }) => sum + q.answer_length, 0) / questions.length),
      average_word_count: Math.round(questions.reduce((sum: number, q: { word_count: number }) => sum + q.word_count, 0) / questions.length)
    };

    const result = {
      user: {
        name: user[0].name,
        link: user[0].link
      },
      test: {
        id: test[0].id,
        name: test[0].name,
        completed_at: test[0].created_at
      },
      device_info: deviceInfo,
      questions: questions,
      summary: summary
    };

    return reply.send(result);
  });

  done();
}
