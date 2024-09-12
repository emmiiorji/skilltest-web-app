import { FastifyInstance } from 'fastify';
import { profileService } from '../services/profile.service';

export function profileController(app: FastifyInstance, opts: any, done: () => void) {
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

  done();
}