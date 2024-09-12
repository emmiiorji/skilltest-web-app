import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { ProfileInput } from '../database/validators/profile.validator';
import { profileService } from '../services/profile.service';
import { generateRandomString } from '../utils/generateRandomString.utils';

export function profileController(app: FastifyInstance, opts: any, done: () => void) {
  app.get('/create', (request, reply) => {
    reply.view('admin/profile/create', { title: 'Create Profile', url: request.url });
  });

  app.post<{ Body: ProfileInput }>('/create', async (request, reply) => {
    try {
      const profile = await profileService.createProfile(request.body);
      return reply.view('admin/profile/create', {
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
      return reply.view('admin/profile/create', {
        title: 'Create Profile',
        error: errorMessage,
        url: request.url
      });
    }
  });

  app.get('/list', async (request, reply) => {
    const query = request.query as { page?: string };
    const page = Number(query.page ?? 1);
    const limit = 10; // Profiles per page

    try {
      const { profiles, totalPages, currentPage } = await profileService.getProfiles(page, limit);
      return reply.view('admin/profile/list', {
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
      reply.view('admin/profile/list', {
        title: 'View Profiles',
        error: 'Failed to fetch profiles. Please try again.',
        url: request.url
      });
    }
  });

  app.post('/create-ajax', async (request, reply) => {
    try {
      const newProfile = await profileService.createProfile({ name: generateRandomString(8) });
      return reply.send({ success: true, profile: newProfile });
    } catch (error) {
      request.log.error(error, "Error creating profile via AJAX");
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return reply.status(400).send({ success: false, error: errorMessage });
    }
  });

  done();
}