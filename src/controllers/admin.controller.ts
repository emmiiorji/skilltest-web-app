import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { ProfileInput } from '../database/validators/profile.validator';
import { env } from '../env.config';
import { groupService } from '../services/group.service';
import { profileService } from '../services/profile.service';
import { templateService } from '../services/template.service';
import { testService } from '../services/test.service';
import { generateRandomString } from '../utils/helpers';

export function adminController(app: FastifyInstance) {
  app.get('/admin/createProfile', (request, reply) => {
    reply.view('admin/createProfile', { title: 'Create Profile', url: request.url });
  });

  app.post<{ Body: ProfileInput }>('/admin/createProfile', async (request, reply) => {
    try {
      const profile = await profileService.createProfile(request.body);
      return reply.view('admin/createProfile', {
        title: 'Create Profile',
        success: true,
        userId: profile.id,
        url: request.url
      });
    } catch (error) {
      request.log.error(error, "Error creating profile");
      let errorMessage = 'Failed to create profile. Please try again.';
      if (error instanceof ZodError) {
        errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return reply.view('admin/createProfile', {
        title: 'Create Profile',
        error: errorMessage,
        url: request.url
      });
    }
  });

  app.get('/admin/viewProfiles', async (request, reply) => {
    const query = request.query as { page?: string };
    const page = Number(query.page ?? 1);
    const limit = 10; // Profiles per page

    try {
      const { profiles, totalPages, currentPage } = await profileService.getProfiles(page, limit);
      return reply.view('admin/viewProfiles', {
        title: 'View Profiles',
        profiles,
        totalPages,
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        url: request.url
      });
    } catch (error) {
      request.log.error(error, "Error fetching profiles");
      reply.view('admin/viewProfiles', {
        title: 'View Profiles',
        error: 'Failed to fetch profiles. Please try again.',
        url: request.url
      });
    }
  });

  app.get('/admin/createTest', async (request, reply) => {
    try {
      const groups = await groupService.getAllGroupsIdAndName();
      const profiles = await profileService.getProfilesIdAndName();
      const templates = await templateService.getAllTemplatesIdAndName();
    
      return reply.view('admin/createTest', { groups, profiles, templates, title: 'Create Test', url: request.url });
    } catch (error) {
      request.log.error(error, "Error fetching data for createTest form");
      return reply.view('admin/createTest', {
        title: "Create Test",
        error: 'Failed to load form data. Please try again.',
        url: request.url
      });
    }
  });

  app.post('/admin/createTest', async (request, reply) => {
    const { group_id, profile_id, template_id } = request.body as any;
  
    try {
      const newTest = await testService.createTest({ group_id, profile_id, template_id });
  
      const testUrl = `${env.URL}/test?user=${newTest.profiles[0]?.name}&test=${newTest.name}`;
      return reply.send({ success: true, testUrl });
    } catch (error: unknown) {
      request.log.error(error, "Error creating test");
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return reply.status(400).send({ success: false, error: errorMessage });
    }
  });

  app.post('/admin/createProfileAjax', async (request, reply) => {
    try {
      const newProfile = await profileService.createProfile({ name: generateRandomString(8) });
      return reply.send({ success: true, profile: newProfile });
    } catch (error) {
      request.log.error(error, "Error creating profile via AJAX");
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return reply.status(400).send({ success: false, error: errorMessage });
    }
  });

  app.post('/admin/createGroupAjax', async (_, reply) => {
    try {
      const newGroup = await groupService.createGroup();
      reply.send({ success: true, group: { id: newGroup.id, name: newGroup.name } });
    } catch (error) {
      app.log.error('Error creating group:', error);
      reply.status(500).send({ success: false, error: 'Failed to create group' });
    }
  });

  app.post('/admin/createTemplateAjax', async (_, reply) => {
    try {
      const newTemplate = await templateService.createTemplate();
      reply.send({ success: true, template: newTemplate });
    } catch (error) {
      app.log.error('Error creating template:', error);
      reply.status(500).send({ success: false, error: 'Failed to create template' });
    }
  });
}