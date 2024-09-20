import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { groupController } from '../controllers/group.controller';
import { profileController } from '../controllers/profile.controller';
import { testController } from '../controllers/test.controller';

const authenticateAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  const { key } = request.query as { key?: string };
  if (key !== process.env.KEY) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
};

export default async function adminRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateAdmin);

  fastify.register(profileController, { prefix: '/profile' });
  fastify.register(testController, { prefix: '/test' });
  fastify.register(groupController, { prefix: '/group' });
}