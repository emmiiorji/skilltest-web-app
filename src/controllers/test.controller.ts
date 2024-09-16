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
      user: profile_id, 
      test: test_id, 
      template: template_id 
    } = await z.object({
      group: z.coerce.number(),
      user: z.coerce.number(),
      test: z.coerce.number(),
      template: z.coerce.number().optional()
    }).parseAsync(request.query);

    try {

      const test = await testService.getTestById(test_id);
      if (!test) {
        throw new Error('Test not found');
      }

      // Check if group and user exist
      let [group, user] = await Promise.all([groupService.getGroupById(group_id), profileService.getProfileById(profile_id)]);
      
      // If group or user does not exist, create them. If the user is not in the group, add them to the group.
      [group, user] = await Promise.all([
        group ?? groupService.createGroup({ id: group_id }), 
        user 
          ? user.groups.every(group => group.id !== group_id)
            ? profileService.updateProfile(profile_id, {groups: [...user.groups, {id: group_id}]}).then(() => user) 
            : user
          : profileService.createProfileById(profile_id, group_id ).then(() => user)
      ]);

      // Linking the user to the test and getting the templates
      const [ idTemplate, firstTemplate ] = await Promise.all ([
        template_id ? templateService.getTemplateById(template_id) : null,
        templateService.getFirstTemplate(),
        testService.linkUserAndGroupToTest(profile_id, group_id, test),
      ]);

      if (!(idTemplate || firstTemplate)) {
        throw new Error('No template found');
      };

      let attendUrl = `${env.URL}/test/attend?user=${profile_id}&test=${test_id}`;
      attendUrl = `<a href=${attendUrl} target="_blank">${attendUrl}</a>`;

      let renderedTemplate = idTemplate 
        ? (idTemplate.template.replaceAll('{url}', attendUrl) && idTemplate.template.replaceAll('{link}', attendUrl)) 
        : (firstTemplate!.template.replaceAll('{url}', attendUrl) && firstTemplate!.template.replaceAll('{link}', attendUrl));
      
      
      return reply.type('text/html').send(renderedTemplate);
    } catch (error) {
      request.log.error(error, "Error processing getlink request");
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return reply.status(400).send({ success: false, error: errorMessage });
    }
  });

  done();
}