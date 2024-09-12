import { FastifyInstance } from 'fastify';
import { profileController } from '../controllers/profile.controller';
import { testController } from '../controllers/test.controller';

export default async function adminRouter(fastify: FastifyInstance) {
  fastify.register(profileController, { prefix: '/profile' });
  fastify.register(testController, { prefix: '/test' });
}