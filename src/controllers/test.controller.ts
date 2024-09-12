import { FastifyInstance } from 'fastify';

interface TestQueryParams {
  user?: string;
  test?: string;
}

export function testController(server: FastifyInstance) {
  server.get<{ Querystring: TestQueryParams }>('/test', async (request, reply) => {
    const { user, test } = request.query;
    
    return reply.view('test', { title: 'Skill Test', user, test, url: request.url });
  });
}