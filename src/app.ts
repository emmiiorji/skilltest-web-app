import fastify from 'fastify';
import { server as app } from './server';

app.setErrorHandler(function (error, request, reply) {
	if (error instanceof fastify.errorCodes.FST_ERR_BAD_STATUS_CODE) {
		// Log error
		request.log.error(error, "Fastify central error handler with bad status code.");
		// Send error response
		reply.status(500).send({ ok: false });
	} else {
		request.log.error(error, "Fastify central error handler.");
		// fastify will use parent error handler to handle this
		reply.send(error);
	}
});

app.get('/', (request, reply) => {
  reply.view('index', { title: 'Skill Test' })
});


export { app };
