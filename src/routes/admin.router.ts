import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { groupController } from '../controllers/group.controller';
import { profileController } from '../controllers/profile.controller';
import { testController } from '../controllers/test.controller';
import { testCreateController } from '../controllers/testCreate.controller';
import { aiExportController } from '../controllers/aiExport.controller';
import { templateController } from '../controllers/template.controller';
import { env } from '../env.config';

const authenticateAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  const { key } = request.query as { key?: string };
  if (key !== env.KEY) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
};

export default async function adminRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateAdmin);

  fastify.register(profileController, { prefix: '/profile' });
  fastify.register(groupController, { prefix: '/group' });
  fastify.register(testController, { prefix: '/test' });
  fastify.register(testCreateController, { prefix: '/test' });
  fastify.register(aiExportController, { prefix: '/test' });
  fastify.register(templateController, { prefix: '/template' });
}