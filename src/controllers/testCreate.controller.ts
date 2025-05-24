import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { templateService } from '../services/template.service';
import { testService } from '../services/test.service';
import { profileService } from '../services/profile.service';
import { groupService } from '../services/group.service';
import { questionService } from '../services/question.service';
import { env } from '../env.config';
import { TrackingConfig } from '../types/tracking';

export function testCreateController(app: FastifyInstance, opts: any, done: () => void) {

  app.get('/create', async (request, reply) => {
    const templates = await templateService.getAllTemplatesIdAndName();

    const { key } = z.object({
      key: z.string(),
    }).parse(request.query);

    return reply.view('admin/test/create', {
      title: 'Create Test',
      templates,
      key,
      url: request.url
    });
  });

  app.post('/create-link', async (request, reply) => {
    const { template_id, test_name, freelancer_input, tracking_config, questions } = z.object({
      template_id: z.string(),
      test_name: z.string().optional(),
      freelancer_input: z.string(),
      tracking_config: z.object({
        disableFocusLostEvents: z.boolean().optional(),
        disableMouseClickEvents: z.boolean().optional(),
        disableKeyboardPressEvents: z.boolean().optional(),
        disableDeviceFingerprint: z.boolean().optional(),
        disableClipboardEvents: z.boolean().optional(),
        disableAnswerChangeEvents: z.boolean().optional(),
        disablePreSubmitDelay: z.boolean().optional(),
        disableTimeToFirstInteraction: z.boolean().optional()
      }).optional().default({}) as z.ZodType<TrackingConfig>,
      questions: z.array(z.object({
        question: z.string(),
        answer_type: z.enum(["textarea", "radiobutton", "multiinput", "multiTextInput"]),
        answer_html: z.string(),
        correct: z.string()
      })).optional().default([])
    }).parse(request.body);

    // Parse freelancer ID from input
    let freelancerId = freelancer_input;
    if (freelancer_input.includes('upwork.com')) {
      const match = freelancer_input.match(/~([a-zA-Z0-9]+)/);
      freelancerId = match && match[1] ? match[1] : freelancer_input;
    }

    // Get profile and its associated group
    const profile = await profileService.getProfileByLinkId(freelancerId);
    if (!profile) {
      return reply.status(404).send({ error: 'Profile not found' });
    }
    
    // Use the first group associated with the profile
    if (!profile.groups || profile.groups.length < 1 || !profile.groups[0]) {
      return reply.status(400).send({ error: 'Profile has no associated group' });
    }
    
    const group_id = profile.groups[0].id;

    // Create test with the profile's group
    const test = await testService.createTest({
      group_id,
      profile_id: profile.id,
      tracking_config,
      test_name
    });

    // Create questions and associate them with the test
    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const questionData = questions[i];
        if (!questionData) continue;

        try {
          // Create the question
          const question = await questionService.createQuestion({
            question: questionData.question,
            answer_type: questionData.answer_type,
            answer_html: questionData.answer_html,
            correct: questionData.correct
          });

          // Associate the question with the test
          await questionService.addQuestionToTest(question.id, test.id, i + 1);
        } catch (error) {
          console.error('Error creating question:', error);
          // Continue with other questions even if one fails
        }
      }
    }

    // Generate link
    const template = await templateService.getTemplateById(parseInt(template_id));
    const testUrl = `${env.URL}/test/attend?user=${freelancerId}&test=${test.id}`;
    const message = template?.template.replace(/{url}|{link}/g, testUrl);

    return reply.send({
      success: true,
      message,
      freelancerId,
      testUrl,
      questions_added: questions.length
    });
  });

  done();
}
