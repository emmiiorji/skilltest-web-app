import fastifyHelmet from '@fastify/helmet';
import fastifyView from '@fastify/view';
import Fastify from 'fastify';
import Handlebars from 'handlebars';
import { join } from 'path';
import { initializeDatabase } from './database/connection';
import { env } from './env.config';

const server = Fastify({
  logger: true,
});

server.register(fastifyHelmet)
server.register(fastifyView, {
  engine: {
    handlebars: Handlebars
  },
  root: join(__dirname, 'views'),
  layout: 'layouts/layout',
  options: {
    partials: {
      header: 'partials/header.hbs',
      footer: 'partials/footer.hbs'
    }
  }
})

server.get('/', (request, reply) => {
  reply.view('index', { title: 'Skill Test' })
})

async function startServer() {
  try {
    await initializeDatabase();
    await server.listen({ port: env.PORT });
    console.log(`Server is running on http://localhost:${env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

startServer();