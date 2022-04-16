/* eslint-disable camelcase */
import Fastify from 'fastify';
import delay from 'delay';

const fastify = Fastify({
	logger: true,
});
fastify.addHook('preHandler', (request, reply, done) => {
	reply.headers({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
	});
	done();
});

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

fastify.post('/mock-token', async (request, reply) => {
	const { code, client_id, grant_type, redirect_uri } = request.query as any;

	await delay(1000);

	reply.send({
		access_token: 'SOME_ACCESS_TOKEN',
		expires_in: 3600,
		refresh_token: 'SOME_REFRESH_TOKEN',
		scope: 'SOME_SCOPE',
		token_type: 'Bearer',
	});
});

fastify.listen(3001, (error) => {
	if (error) throw error;
});
