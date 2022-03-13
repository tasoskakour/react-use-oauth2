/* eslint-disable camelcase */
import Fastify from 'fastify';
import fetch from 'node-fetch';
// import fastifyCors from 'fastify-cors';

const fastify = Fastify({
	logger: true,
});

// fastify.register(fastifyCors);

type Query = {
	client_id: string;
	code: string;
	grant_type: string;
	redirect_uri: string;
};

const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const AUTHORIZATION_SERVER_TOKEN_URL = process.env.AUTHORIZATION_SERVER_TOKEN_URL as string;
console.log({ CLIENT_SECRET, AUTHORIZATION_SERVER_TOKEN_URL });

fastify.post('/token', async (request, reply) => {
	const { code, client_id, grant_type, redirect_uri } = request.query as Query;

	const data = await fetch(
		`${AUTHORIZATION_SERVER_TOKEN_URL}?grant_type=${grant_type}&client_id=${client_id}&client_secret=${CLIENT_SECRET}&redirect_uri=${redirect_uri}&code=${code}`,
		{
			method: 'POST',
		}
	);
	console.log(data);

	reply.send(await data.json());
});

fastify.listen(3001, (error) => {
	if (error) throw error;
});

// console.log('Hello');

/* eslint-disable camelcase */
// import Koa from 'koa';
// import Router from '@koa/router';
// import cors from '@koa/cors';

// const app = new Koa();
// const router = new Router();

// type Query = {
// 	client_id: string;
// 	code: string;
// 	grant_type: string;
// 	redirect_uri: string;
// };

// const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
// const AUTHORIZATION_SERVER_TOKEN_URL = process.env.AUTHORIZATION_SERVER_TOKEN_URL as string;

// router.post('/token', async (context, next) => {
// 	// ctx.router available
// 	const { code, client_id, grant_type, redirect_uri } = context.query as Query;

// 	const data = await fetch(
// 		`${AUTHORIZATION_SERVER_TOKEN_URL}?grant_type=${grant_type}&client_id=${client_id}&client_secret=${CLIENT_SECRET}&redirect_uri=${redirect_uri}&code=${code}`,
// 		{
// 			method: 'POST',
// 		}
// 	);

// 	context.body = data;
// });

// app.use(cors());
// app.use(router.routes()).use(router.allowedMethods());

// app.listen(3001);
