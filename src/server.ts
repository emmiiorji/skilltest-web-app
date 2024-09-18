import fastifyCors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import fastifyHelmet from '@fastify/helmet';
import fastifySecureSession from '@fastify/secure-session';
import fastifySensible from '@fastify/sensible';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import Fastify, { FastifyRequest } from 'fastify';
import Handlebars from 'handlebars';
import path, { join } from 'path';
import { connection } from './database/connection';
import { env, isProd } from './env.config';
import adminRouter from './routes/admin.router';
import attendTestRouter from './routes/attendTest.router';
import { registerHandlebarsHelpers } from './utils/handlebars-helpers.utils';

const server = Fastify({
  logger: true,
  bodyLimit: 1024 * 1024 * 10, // 10MB
  // trustProxy: true, // Enables the use of X-Forwarded- headers, useful if you're behind a reverse proxy.
  ignoreTrailingSlash: true,
  caseSensitive: false,
  maxParamLength: 1000,
});

export const logger = server.log;

// Add CORS with strict configuration
server.register(fastifyCors, {
  origin: false,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600, // 10 minutes
});

// Add @fastify/sensible
server.register(fastifySensible);

// Add @fastify/secure-session with strict configuration
server.register(fastifySecureSession, {
  secret: env.SESSION_SECRET,
  salt: env.SESSION_SALT,
  cookieName: '__session',
  cookie: {
    path: '/',
    httpOnly: true,
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60, // 1 week
    sameSite: 'strict'
  }
});

// Add Helmet with strict CSP
server.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Consider removing 'unsafe-inline' if possible
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://siteimages.b-cdn.net"],
      connectSrc: ["'self'", "https://api.ipify.org"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  referrerPolicy: {
    policy: 'same-origin'
  },
});

server.register(fastifyFormbody);

server.register(fastifyView, {
  engine: {
    handlebars: Handlebars
  },
  root: join(__dirname, 'views'),
  layout: 'layouts/layout',
  options: {
    // partials: {
    //   header: 'partials/header.hbs',
    //   footer: 'partials/footer.hbs'
    // }
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
    request.log.error(error, "Fastify central error handler with bad status code.");
    if(!reply.sent)
    reply.status(500).send({ ok: false, error: 'Internal Server Error' });
  } else {
    request.log.error(error, "Fastify central error handler.");
    if(!reply.sent)
    reply.send({ ok: false, error: error.message || 'Unknown error occurred' });
  }
});

server.get('/', (request, reply) => {
  reply.view('index', { title: 'Skill Test', 
    url: request.url })
});

// Register admin router
server.register(adminRouter, { prefix: '/admin' });
server.register(attendTestRouter, { prefix: '/test' });

// Serve static files from the public directory
server.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/',
});

async function startServer() {
  try {
    const dataSource = await connection();
    const sqlVersion = await dataSource.query('SELECT VERSION() as version');
    console.log('SQL Server Version:', sqlVersion[0].version);
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
