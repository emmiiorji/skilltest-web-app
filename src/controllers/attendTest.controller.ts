import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export function attendTestController(app: FastifyInstance, opts: any, done: () => void) {
  app.get('/attend', async (
    request: FastifyRequest<{ Querystring: { user: string; test: string } }>,
    reply: FastifyReply
  ) => {
    const { user, test } = request.query

    return reply.view('/test/attend', { title: 'Take Test', user, test, url: request.url })
  });

  done();
}