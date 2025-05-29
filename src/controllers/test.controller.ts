import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../env.config';
import { groupService } from '../services/group.service';
import { profileService } from '../services/profile.service';
import { templateService } from '../services/template.service';
import { testService } from '../services/test.service';

export function testController(app: FastifyInstance, opts: any, done: () => void) {
  app.get('/getlink', async (request, reply) => {
    let {
      group: group_id,
      user: userLinkId,
      test: test_id,
      template: template_id
    } = await z.object({
      group: z.coerce.number(),
      user: z.string(),
      test: z.coerce.number(),
      template: z.coerce.number().optional()
    }).parseAsync(request.query);

    try {

      const existingTest = await testService.isTestAssignedToUser({linkId: userLinkId, testId: test_id});

      if(existingTest) {
        return reply.type('text/html').send(`
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 30px;
            background-color: #f8f9fa;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
          ">
            <h2 style="color: #007bff; margin-bottom: 20px;">Test Already Assigned</h2>
            <p style="font-size: 18px; color: #495057;">
              We already assigned this test to this user.
            </p>
          </div>
        `);
      }

      const test = await testService.getTestById(test_id);
      if (!test) {
        throw new Error('Test not found');
      }

      // Get or create user and group in parallel
      const [user, _group] = await Promise.all([
        profileService.getProfileByLinkId(userLinkId)
          .then(user => user ?? profileService.createProfileByLinkId(userLinkId)),
        groupService.getGroupById(group_id)
          .then(group => group ?? groupService.createGroup({ id: group_id }))
      ]);

      // If the user is not in the group, add relation with the group
      if (user.groups.every(group => group.id !== group_id)) {
        await profileService.updateProfile(user, group_id);
      }

      // Link user to test and get templates in parallel
      const [idTemplate, firstTemplate] = await Promise.all([
        template_id ? templateService.getTemplateById(template_id) : null,
        templateService.getFirstTemplate(),
        testService.linkUserAndGroupToTest(user.id, group_id, test)
      ]);

      if (!(idTemplate || firstTemplate)) {
        throw new Error('No template found');
      };

      let attendUrl = `${env.URL}/test/attend?user=${userLinkId}&test=${test_id}`;
      attendUrl = `<a href=${attendUrl} target="_blank">${attendUrl}</a>`;

      let renderedTemplate = idTemplate
        ? idTemplate.template.replaceAll('{url}', attendUrl)
        : firstTemplate!.template.replaceAll('{url}', attendUrl);

      renderedTemplate = renderedTemplate.replaceAll('{link}', attendUrl);

      return reply.type('text/html').send(renderedTemplate);
    } catch (error) {
      request.log.error(error, "Error processing getlink request");
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return reply.status(400).send({ success: false, error: errorMessage });
    }
  });

  done();
}
