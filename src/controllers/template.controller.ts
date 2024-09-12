import { FastifyInstance } from 'fastify';
import { templateService } from '../services/template.service';

export function templateController(app: FastifyInstance, opts: any, done: () => void) {
  app.post('/create-ajax', async (_, reply) => {
    try {
      const newTemplate = await templateService.createTemplate();
      reply.send({ success: true, template: newTemplate });
    } catch (error) {
      app.log.error('Error creating template:', error);
      reply.status(500).send({ success: false, error: 'Failed to create template' });
    }
  });

  done();
}