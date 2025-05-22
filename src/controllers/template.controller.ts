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

  

  // Show template creation form
  app.get('/create', async (request, reply) => {
    try {
      const { key } = z.object({
        key: z.string(),
      }).parse(request.query);

      return reply.view('admin/template/create', {
        title: 'Create Template',
        key,
        url: request.url
      });
    } catch (error) {
      request.log.error(error, "Error loading template creation form");
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  done();
}
