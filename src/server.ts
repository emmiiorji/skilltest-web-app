import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifySecureSession from '@fastify/secure-session';
import fastifySensible from '@fastify/sensible';
import fastifyView from '@fastify/view';
import Fastify from 'fastify';
import Handlebars from 'handlebars';
import { join } from 'path';
import { initializeDatabase } from './database/connection';
import { env } from './env.config';

export const server = Fastify({
  logger: true,
	bodyLimit: 1024 * 1024 * 10, // 10MB
  // trustProxy: true, // Enables the use of X-Forwarded- headers, useful if you're behind a reverse proxy.
  ignoreTrailingSlash: true,
  caseSensitive: false,
  maxParamLength: 1000,
});

export const logger = server.log;

// Add CORS to only accept connections from the same domain
server.register(fastifyCors, {
  origin: false,
});

// Add @fastify/sensible
server.register(fastifySensible);

// Add @fastify/secure-session with strict configuration
server.register(fastifySecureSession, {
  secret: env.SESSION_SECRET, // Make sure to add this to your env.config.ts
  salt: 'mq9hDxBVDbspDR6n', // Generate a random salt
  cookieName: '__session',
  cookie: {
    path: '/',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60, // 1 week
    sameSite: 'strict'
  }
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

async function startServer() {
  try {
    await initializeDatabase();
    await server.listen({ port: env.PORT,  host: "0.0.0.0" });
    server.log.info(`Server is running on http://localhost:${env.PORT}`);
  } catch (err) {
    server.log.fatal(err);
    process.exit(1);
  }
};


const unexpectedErrorHandler = (error: unknown) => {
	server.log.fatal(error, "Unexpected error.");
	server.close();
	process.exit(1);
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

startServer();