import { FastifyInstance } from 'fastify';
import { groupController } from '../controllers/group.controller';
import { profileController } from '../controllers/profile.controller';
import { testController } from '../controllers/test.controller';
import { viewResultsController } from '../controllers/viewResults.controller';

export default async function adminRouter(fastify: FastifyInstance) {
  fastify.register(viewResultsController, { prefix: '/results' });
  fastify.register(profileController, { prefix: '/profile' });
  fastify.register(testController, { prefix: '/test' });
  fastify.register(groupController, { prefix: '/group' });
}