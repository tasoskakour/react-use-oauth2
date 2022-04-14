/* eslint-disable camelcase */
import Fastify from 'fastify';
import fetch from 'node-fetch';

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

type Query = {
	client_id: string;
	code: string;
	grant_type: string;
	redirect_uri: string;
};

const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const AUTHORIZATION_SERVER_TOKEN_URL = process.env.AUTHORIZATION_SERVER_TOKEN_URL as string;

fastify.head('/', async (request, reply) => {
	reply.send('OK');
});

fastify.post('/token', async (request, reply) => {
	const { code, client_id, grant_type, redirect_uri } = request.query as Query;

	const data = await fetch(
		`${AUTHORIZATION_SERVER_TOKEN_URL}?grant_type=${grant_type}&client_id=${client_id}&client_secret=${CLIENT_SECRET}&redirect_uri=${redirect_uri}&code=${code}`,
		{
			method: 'POST',
		}
	);

	reply.send(await data.json());
});

fastify.listen(3001, (error) => {
	if (error) throw error;
});
