import { FastifyInstance } from 'fastify';
import { env } from '../env.config';
import { groupService } from '../services/group.service';
import { profileService } from '../services/profile.service';
import { templateService } from '../services/template.service';
import { testService } from '../services/test.service';

export function testController(app: FastifyInstance, opts: any, done: () => void) {
  app.get('/create', async (request, reply) => {
    try {
      const groups = await groupService.getAllGroupsIdAndName();
      const profiles = await profileService.getProfilesIdAndName();
      const templates = await templateService.getAllTemplatesIdAndName();
    
      return reply.view('admin/test/create', { groups, profiles, templates, title: 'Create Test', url: request.url });
    } catch (error) {
      request.log.error(error, "Error fetching data for createTest form");
      return reply.view('admin/test/create', {
        title: "Create Test",
        error: 'Failed to load form data. Please try again.',
        url: request.url
      });
    }
  });

  app.post('/create', async (request, reply) => {
    const { group_id, profile_id, template_id } = request.body as any;
  
    try {
      const newTest = await testService.createTest({ group_id, profile_id, template_id });
  
      const testUrl = `${env.URL}/test/attend?user=${newTest.profiles[0]?.name}&test=${newTest.name}`;
      return reply.send({ success: true, testUrl });
    } catch (error: unknown) {
      request.log.error(error, "Error creating test");
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return reply.status(400).send({ success: false, error: errorMessage });
    }
  });

  done();
}