import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { In, Not } from 'typeorm';
import { z } from 'zod';
import { connection } from '../database/connection';
import { Answer } from '../database/entities/Answer.entity';
import { Question } from '../database/entities/Question.entity';
import { Test } from '../database/entities/Test.entity';
import { AnswerSchema } from '../database/validators/answer.validation';
import { env } from '../env.config';
import { profileService } from '../services/profile.service';
import { checkAnswerCorrectness } from '../utils/checkAnswerCorrectness';
import { testService } from '../services/test.service';

const decryptPayload = (encryptedPayload: string, key: string) => {
  try {
    const text = atob(encryptedPayload);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return JSON.parse(result);
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

export function attendTestController(app: FastifyInstance, opts: any, done: () => void) {

  const checkTestExistsForUser = async (profile_id: number, test_id: number) => {
    const dataSource = await connection();
    const testRepo = dataSource.getRepository(Test);
    return await testRepo.findOne({ where: { id: test_id, profiles: { id: profile_id } } });
  };

  app.get('/attend', async (
    request: FastifyRequest<{ Querystring: { start?: true, user: string; test: string } }>,
    reply: FastifyReply
  ) => {
    const dataSource = await connection();
    const answerRepo = dataSource.getRepository(Answer);
    const questionRepo = dataSource.getRepository(Question);
    const { start, user: userLinkId, test: test_id } = z.object({
      start: z.string().optional().transform((value) => value === "true"),
      user: z.string(),
      test: z.coerce.number(),
    }).parse(request.query);

    const profile = await profileService.getProfileByLinkId(userLinkId);
    if (!profile) {
      return reply.status(404).send({ error: 'Invalid URL or test not found' });
    };

    const testExists = await checkTestExistsForUser(profile.id, test_id);
    if (!testExists) {
      return reply.status(404).send({ error: 'Invalid URL or test not found' });
    }

    const answeredQuestionsIds = await answerRepo.find({
      where: { test: { id: test_id }, profile: { id: profile.id } },
      select: ['question_id'],
    }).then(answers => answers.map(a => a.question_id));

    // If no questions have been answered, show the welcome page
    if (!start) {
      return reply.view(`/test/start`, {
        title: 'Start Test',
        userLinkId,
        test_id,
        url: request.url,
      });
    }


    const pendingQuestion = await questionRepo.findOne({
      relations: ["questionTests"],
      where: {
        id: Not(In(answeredQuestionsIds)),
        questionTests: { test_id }
      }
    });

    if (!pendingQuestion) {
      return reply.view('test/completed', { title: 'Test Completed', url: request.url });
    }

    reply.header('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');
    reply.header('Surrogate-Control', 'no-store');

    const test = await testService.getTestById(test_id);

    return reply.view('test/attend', {
      title: 'Take Test',
      user_id: profile.id,
      userLinkId,
      test_id,
      url: request.url,
      question: pendingQuestion.question,
      question_id: pendingQuestion.id,
      answer_type: pendingQuestion.answer_type,
      answer_html: pendingQuestion.answer_html,
      tracking_config: test?.tracking_config || {},
      result_salt: env.RESULT_SALT,
    });
  });

  app.post('/attend', async (
    request: FastifyRequest<{
      Body: { hashed_payload: string },
      Querystring: { user: string; test: string }
    }>,
    reply: FastifyReply
  ) => {
    const dataSource = await connection();
    const answerRepo = dataSource.getRepository(Answer);
    const questionRepo = dataSource.getRepository(Question);
    const { user: userLinkId, test: testId } = z.object({
      user: z.string(),
      test: z.string(),
    }).parse(request.query);

    const profile = await profileService.getProfileByLinkId(userLinkId);
    if (!profile) {
      return reply.status(404).send({ error: 'Invalid URL or test not found' });
    }

    const encryptionKey = `${profile.id}${env.RESULT_SALT}`;

    let decryptedPayload;
    try {
      decryptedPayload = decryptPayload(request.body.hashed_payload, encryptionKey);
    } catch (error) {
      console.error('Failed to decrypt payload:', error);
      return reply.status(400).send({ error: 'Invalid payload' });
    };

    const { correct: correctAnswer } = await questionRepo.findOneOrFail({
      select: ['correct'],
      where: { id: decryptedPayload.question_id }
    });

    const is_correct = checkAnswerCorrectness(decryptedPayload.answer, correctAnswer);

    if (Array.isArray(decryptedPayload.answer)) {
      decryptedPayload.answer = JSON.stringify(decryptedPayload.answer);
    }

    // Validate and sanitize tracking data - only process fields that are present
    const sanitizeTrackingData = (data: any) => {
      if (!data || typeof data !== 'object') return {};

      // Limit array sizes for performance
      const limitArray = (arr: any[], limit = 1000) =>
        Array.isArray(arr) ? arr.slice(0, limit) : [];

      const sanitized: any = {};

      // Only include fields that are present in the payload (enabled tracking)
      if (data.focus_lost_events !== undefined) {
        sanitized.focus_lost_events = limitArray(data.focus_lost_events);
      }

      if (data.clipboard_events !== undefined) {
        sanitized.clipboard_events = limitArray(data.clipboard_events);
      }

      if (data.answer_change_events !== undefined) {
        sanitized.answer_change_events = limitArray(data.answer_change_events);
      }

      if (data.mouse_click_events !== undefined) {
        sanitized.mouse_click_events = limitArray(data.mouse_click_events);
      }

      if (data.keyboard_press_events !== undefined) {
        sanitized.keyboard_press_events = limitArray(data.keyboard_press_events);
      }

      if (data.device_fingerprint !== undefined) {
        sanitized.device_fingerprint = typeof data.device_fingerprint === 'object' ? data.device_fingerprint : {};
      }

      if (data.device_type !== undefined) {
        sanitized.device_type = ['desktop', 'mobile', 'tablet'].includes(data.device_type) ? data.device_type : 'desktop';
      }

      if (data.pre_submit_delay !== undefined) {
        sanitized.pre_submit_delay = typeof data.pre_submit_delay === 'number' ? Math.max(0, data.pre_submit_delay) : 0;
      }

      if (data.time_to_first_interaction !== undefined) {
        sanitized.time_to_first_interaction = typeof data.time_to_first_interaction === 'number' ? Math.max(0, data.time_to_first_interaction) : 0;
      }

      return sanitized;
    };

    const trackingData = sanitizeTrackingData(decryptedPayload);

    const validatedAnswer = AnswerSchema.parse({
      ...decryptedPayload,
      ...trackingData
    });

    const newAnswer = answerRepo.create({
      is_correct,
      user_agent: request.headers['trc'] as string || '',
      ...validatedAnswer,
    });

    await answerRepo.save(newAnswer);

    return reply.send({ success: true });
  });

  done();
}