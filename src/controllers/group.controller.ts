import { FastifyInstance } from 'fastify';
import { groupService } from '../services/group.service';

export function groupController(app: FastifyInstance, opts: any, done: () => void) {
  app.post('/create-ajax', async (_, reply) => {
    try {
      const newGroup = await groupService.createGroup();
      reply.send({ success: true, group: { id: newGroup.id, name: newGroup.name } });
    } catch (error) {
      app.log.error('Error creating group:', error);
      reply.status(500).send({ success: false, error: 'Failed to create group' });
    }
  });

  done();
}