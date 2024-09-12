import fastifyCors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody'; // Add this import
import fastifyHelmet from '@fastify/helmet';
import fastifySecureSession from '@fastify/secure-session';
import fastifySensible from '@fastify/sensible';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import Fastify, { FastifyRequest } from 'fastify';
import Handlebars from 'handlebars';
import path, { join } from 'path';
import { adminController } from './controllers/admin.controller';
import { testController } from './controllers/test.controller';
import { initializeDatabase } from './database/connection';
import { env, isProd } from './env.config';
import { registerHandlebarsHelpers } from './utils/handlebars-helpers';

const server = Fastify({
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
  secret: env.SESSION_SECRET,
  salt: 'mq9hDxBVDbspDR6n', // Generate a random salt
  cookieName: '__session',
  cookie: {
    path: '/',
    httpOnly: true,
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60, // 1 week
    sameSite: 'strict'
  }
});

server.register(fastifyHelmet)
server.register(fastifyFormbody);

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
  },
  defaultContext: (request: FastifyRequest) => {
    return {
      url: request.url
    };
  }
})
registerHandlebarsHelpers();

server.setErrorHandler(function (error, request, reply) {
	if (error instanceof Fastify.errorCodes.FST_ERR_BAD_STATUS_CODE) {
    // Log error
		request.log.error(error, "Fastify central error handler with bad status code.");
		// Send error response
    if(!reply.sent)
		reply.status(500).send({ ok: false, error: 'Internal Server Error' });
	} else {
    request.log.error(error, "Fastify central error handler.");
		// fastify will use parent error handler to handle this
    if(!reply.sent)
		reply.send({ ok: false, error: error.message || 'Unknown error occurred' });
	}
});

server.get('/', (request, reply) => {
  reply.view('index', { title: 'Skill Test', 
    url: request.url })
});

// Register admin routes
adminController(server);

// Register test routes
testController(server);

// Serve static files from the public directory
server.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/',
});

async function startServer() {
  try {
    await initializeDatabase();
    await server.listen({ port: env.PORT, host: "0.0.0.0" });
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
