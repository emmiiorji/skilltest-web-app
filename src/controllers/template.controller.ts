import { FastifyInstance } from 'fastify';
import { templateService } from '../services/template.service';
import { z } from 'zod';

export function templateController(app: FastifyInstance, opts: any, done: () => void) {

  // Create a new template. Optionally with custom content
  app.post('/create', async (request, reply) => {
    try {
      const { template: templateString } = z.object({ template: z.string() }).parse(request.body);

      const template = await templateService.createTemplate(templateString);

      return reply.send({
        success: true,
        template
      });
    } catch (error) {
      request.log.error(error, "Error creating template with content");
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return reply.status(400).send({
        success: false,
        error: errorMessage
      });
    }
  });

  done();
}
