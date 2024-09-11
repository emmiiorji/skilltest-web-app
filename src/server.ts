import fastifyHelmet from '@fastify/helmet';
import fastifyView from '@fastify/view';
import fastify from 'fastify';
import Handlebars from 'handlebars';
import { join } from 'path';
import { env } from './env.config';

const server = fastify()

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

server.listen({ port: env.PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})