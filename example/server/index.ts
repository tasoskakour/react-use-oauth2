/* eslint-disable camelcase */
import Fastify from 'fastify';
import delay from 'delay';
import formBody from '@fastify/formbody';
import cors from '@fastify/cors';

const fastify = Fastify({
	logger: true,
	exposeHeadRoutes: true,
});

// eslint-disable-next-line import/no-extraneous-dependencies, unicorn/prefer-module, @typescript-eslint/no-var-requires
fastify.register(cors, {
	// put your options here
});
fastify.register(formBody);

fastify.head('/', async (request, reply) => {
	reply.send('OK');
});

fastify.get('/mock-authorize', async (request, reply) => {
	const { redirect_uri, state, response_type } = request.query as any;

	await delay(500);

	if (response_type === 'code') {
		reply.redirect(`${redirect_uri}?code=SOME_CODE&state=${state}`);
	} else {
		reply.redirect(
			`${redirect_uri}?access_token=SOME_ACCESS_TOKEN&token_type=Bearer&expires_in=3600&state=${state}`
		);
	}
});

fastify.get('/mock-token', async (request, reply) => {
	await delay(1000);

	const { code } = request.query as any;

	reply.send({
		code,
		access_token: `SOME_ACCESS_TOKEN`,
		expires_in: 3600,
		refresh_token: 'SOME_REFRESH_TOKEN',
		scope: 'SOME_SCOPE',
		token_type: 'Bearer',
	});
});

fastify.post('/mock-token-form-data', async (request, reply) => {
	await delay(1000);

	reply.send({
		code: (request.body as any).code,
		access_token: `SOME_ACCESS_TOKEN`,
		expires_in: 3600,
		refresh_token: 'SOME_REFRESH_TOKEN',
		scope: 'SOME_SCOPE',
		token_type: 'Bearer',
	});
});

fastify.listen({ port: 3001, host: 'localhost' }, (error) => {
	if (error) throw error;
});
