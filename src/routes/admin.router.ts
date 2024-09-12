import { FastifyInstance } from 'fastify';
import { groupController } from '../controllers/group.controller';
import { profileController } from '../controllers/profile.controller';
import { templateController } from '../controllers/template.controller';
import { testController } from '../controllers/test.controller';

export default async function adminRouter(fastify: FastifyInstance) {
  fastify.register(profileController, { prefix: '/profile' });
  fastify.register(testController, { prefix: '/test' });
  fastify.register(groupController, { prefix: '/group' });
  fastify.register(templateController, { prefix: '/template' });
}