import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { In, Not } from 'typeorm';
import { z } from 'zod';
import { AppDataSource } from '../database/connection';
import { Answer } from '../database/entities/Answer.entity';
import { Question } from '../database/entities/Question.entity';
import { Test } from '../database/entities/Test.entity';
import { AnswerSchema } from '../database/validators/answer.validation';
import { profileService } from '../services/profile.service';
import { checkAnswerCorrectness } from '../utils/checkAnswerCorrectness';

export function attendTestController(app: FastifyInstance, opts: any, done: () => void) {
  const answerRepo = AppDataSource.getRepository(Answer);
  const questionRepo = AppDataSource.getRepository(Question);

  const checkTestExistsForUser = async (profile_id: number, test_id: number) => {
    const testRepo = AppDataSource.getRepository(Test);
    return await testRepo.findOne({ where: { id: test_id, profiles: { id: profile_id } } });
  };

  app.get('/attend', async (
    request: FastifyRequest<{ Querystring: { user: string; test: string } }>,
    reply: FastifyReply
  ) => {
    const { user: userLinkId, test: test_id } = z.object({
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
    });
  });

  app.post('/attend', async (
    request: FastifyRequest<{ 
      Body: z.infer<typeof AnswerSchema> & { user_id: number; test_id: number },
      Querystring: { user: string; test: string }
    }>,
    reply: FastifyReply
  ) => {
    const { user: userLinkId } = z.object({
      user: z.string(),
    }).parse(request.query);

    const { correct: correctAnswer } = await questionRepo.findOneOrFail({ 
      select: ['correct'],
      where: { id: request.body.question_id } 
    });

    const is_correct = checkAnswerCorrectness(request.body.answer, correctAnswer);
    
    if (typeof request.body.answer === 'object') {
      request.body.answer = JSON.stringify(request.body.answer);
    };

    const {ip, ...validatedAnswer} = AnswerSchema.parse(request.body);
    console.debug({validatedAnswer});

    const newAnswer = answerRepo.create({
      is_correct,
      user_agent: request.headers['user-agent'] || '',
      ip: ip || request.ip,
      ...validatedAnswer,
    });

    await answerRepo.save(newAnswer);

    return reply.redirect(`/test/attend?user=${userLinkId}&test=${validatedAnswer.test_id}`);
  });

  done();
}

/*
When the user comes to the `/test/attend` route. 

1. Check if the `test_id` is assigned to this `user_id`. If not show the user that the url is invalid.
2. Based on the `user_id`& `test_id` get id of all the questions that has already been answered from@Answer.entity.ts.
3. Get all the questions in the database which have not been answered already.
4. If there no questions pending to be answered, show to user that the test is already been completed.
4. Show the user questions one by one. 
5. Once the user answers & clicks on submit, validate the answer via zod & update the answer in database.
     a. check for correctness for a part with checking test results, in "correct" field we will need to have array of possible correct answers, it's for a case when 1 question can have 2 correct answers, for example like this: [[4,5,6], [6,5,4]] or ['first', 'second', 'third'] or ['Promise']
6. Once the answer is updated, show the user the next question.

Frontend instructions:
1. Mobile optimized (add mobile layout likely separate left and right block to different rows)
         a. left block and right block on mobile fit 100% of the width of the screen (set max width)
2. Desktop - no vertical scroll
         a. Set max height (if block higher like image height make it smaller)
         b. Center content until to fit max height
3. Show radio buttons/checkboxes/textarea based on the `answer_type` column in@Question.entity.ts.
4. Start counting time spent on answering each question.
5. Track right click/ctrl+c/ctrl+v/inactive time usage (Inactive time measn time when user left current browser tab)

Please dont be sloppy. Implement all the backend & frontend changes completely. Dont lecture me. Make this whole feature end-to-end & double check everything to make sure everything has been considered & implemented.
*/