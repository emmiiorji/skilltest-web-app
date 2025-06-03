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
    const groups = await groupService.getAllGroupsIdAndName();
    const tests = await testService.getAllTestsIdAndName();

    const { key } = z.object({
      key: z.string(),
    }).parse(request.query);

    return reply.view('admin/test/create', {
      title: 'Generate Test Message',
      templates,
      groups,
      tests,
      key,
      url: request.url
    });
  });

  app.post('/create-link', async (request, reply) => {
    const { template_id, test_name, test_id, group_id, freelancer_input, tracking_config, questions } = z.object({
      template_id: z.string(),
      test_name: z.string().optional(),
      test_id: z.coerce.number().optional(),
      group_id: z.coerce.number(),
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

    // Get profile or create if it doesn't exist
    let profile = await profileService.getProfileByLinkId(freelancerId);
    if (!profile) {
      // Create profile if it doesn't exist
      profile = await profileService.createProfileByLinkId(freelancerId);
    }

    // Check if profile is in the selected group, if not add them to it
    if (profile && profile.groups.every(group => group.id !== group_id)) {
      await profileService.updateProfile(profile, group_id);
      // Refresh profile to get updated groups
      profile = await profileService.getProfileByLinkId(freelancerId);
    }

    // Ensure profile exists after all operations
    if (!profile) {
      return reply.status(500).send({ error: 'Failed to create or retrieve profile' });
    }

    // Filter tracking config to only include disabled features (true values)
    const filterTrackingConfig = (config: TrackingConfig): TrackingConfig => {
      if (!config || typeof config !== 'object') return {};

      const filtered: TrackingConfig = {};
      Object.keys(config).forEach(key => {
        const typedKey = key as keyof TrackingConfig;
        if (config[typedKey] === true) {
          filtered[typedKey] = true;
        }
      });
      return filtered;
    };

    // Determine which test to use
    let test;
    let questionsAdded = 0;

    if (test_id) {
      // Use existing test - do NOT create new questions
      test = await testService.getTestById(test_id);
      if (!test) {
        return reply.status(404).send({ error: `Test with ID ${test_id} not found` });
      }
      // Link user and group to existing test
      await testService.linkUserAndGroupToTest(profile.id, group_id, test);

      // For existing tests, don't add questions - just use what's already there
    } else {
      // Create new test
      test = await testService.createTest({
        group_id,
        profile_id: profile.id,
        tracking_config: filterTrackingConfig(tracking_config),
        test_name
      });

      // Only create questions for NEW tests
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
            questionsAdded++;
          } catch (error) {
            console.error('Error creating question:', error);
            // Continue with other questions even if one fails
          }
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
      questions_added: questionsAdded
    });
  });

  // Get test details (questions and config)
  app.get('/details/:testId', async (request, reply) => {
    const { testId } = z.object({
      testId: z.coerce.number(),
    }).parse(request.params);

    const { key } = z.object({
      key: z.string(),
    }).parse(request.query);

    try {
      // Get test details
      const test = await testService.getTestById(testId);
      if (!test) {
        return reply.status(404).send({ error: 'Test not found' });
      }

      // Get questions for this test
      const questions = await questionService.getQuestionsForTest(testId);

      return reply.send({
        success: true,
        test: {
          id: test.id,
          name: test.name,
          tracking_config: test.tracking_config || {}
        },
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          answer_type: q.answer_type,
          answer_html: q.answer_html,
          correct: q.correct
        }))
      });
    } catch (error) {
      console.error('Error fetching test details:', error);
      return reply.status(500).send({ error: 'Failed to fetch test details' });
    }
  });

  // Update test details (questions and config)
  app.put('/update/:testId', async (request, reply) => {
    const { testId } = z.object({
      testId: z.coerce.number(),
    }).parse(request.params);

    const { key } = z.object({
      key: z.string(),
    }).parse(request.query);

    const { tracking_config, questions } = z.object({
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

    try {
      // Get test to verify it exists
      const test = await testService.getTestById(testId);
      if (!test) {
        return reply.status(404).send({ error: 'Test not found' });
      }

      // Update test tracking configuration
      await testService.updateTestTrackingConfig(testId, tracking_config);

      // Remove all existing questions for this test
      const existingQuestions = await questionService.getQuestionsForTest(testId);
      for (const question of existingQuestions) {
        await questionService.removeQuestionFromTest(question.id, testId);
      }

      // Add new questions
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
            await questionService.addQuestionToTest(question.id, testId, i + 1);
          } catch (error) {
            console.error('Error creating question:', error);
            // Continue with other questions even if one fails
          }
        }
      }

      return reply.send({
        success: true,
        message: 'Test updated successfully',
        questions_updated: questions.length
      });
    } catch (error) {
      console.error('Error updating test:', error);
      return reply.status(500).send({ error: 'Failed to update test' });
    }
  });

  done();
}
