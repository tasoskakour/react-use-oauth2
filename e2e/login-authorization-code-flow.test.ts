import puppeteer, { Browser } from 'puppeteer';
import { getTextContent, IS_RUNNING_IN_GITHUB_ACTIONS } from './test-utils';

const URL = 'http://localhost:3000';

let browser: Browser;
afterAll((done) => {
	browser.close();

	done();
});

test('Login with authorization code flow and custom state works as expected', async () => {
	browser = await puppeteer.launch(
		IS_RUNNING_IN_GITHUB_ACTIONS ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : {}
	);
	const page = await browser.newPage();

	await page.goto(URL);

	const nav = new Promise((response) => {
		browser.on('targetcreated', response);
	});

	await page.click('#authorization-code-login');

	// Assess loading
	await page.waitForSelector('#authorization-code-loading');

	// Assess popup redirection
	await nav;
	const pages = await browser.pages();
	expect(pages[2].url()).toMatch(
		/http:\/\/localhost:3000\/callback\?code=SOME_CODE&state=.*\S.*/ // any non-empty state
	);

	// Assess network call to exchange code for token
	await page.waitForResponse(async (response) => {
		if (response.request().method().toUpperCase() === 'OPTIONS') return false;

		const url = decodeURIComponent(response.url());
		const json = await response.json();
		const urlPath = url.split('?')[0];
		const urlQuery = new URLSearchParams(url.replace(urlPath, ''));

		const rawState = urlQuery.get('state');
		const parsedState = JSON.parse(rawState || '{}');

		expect(parsedState).toEqual({
			foo: 'bar',
			john: 'doe',
		}); // ✅ Check extracted custom state content

		return (
			urlPath === 'http://localhost:3001/mock-token' &&
			urlQuery.get('client_id') === 'SOME_CLIENT_ID' &&
			urlQuery.get('grant_type') === 'authorization_code' &&
			urlQuery.get('code') === 'SOME_CODE' &&
			urlQuery.get('redirect_uri') === 'http://localhost:3000/callback' &&
			rawState !== undefined && // state should exist
			Object.keys(parsedState).length === 2 && // must match keys
			json.code === 'SOME_CODE' &&
			json.access_token === 'SOME_ACCESS_TOKEN' &&
			json.expires_in === 3600 &&
			json.refresh_token === 'SOME_REFRESH_TOKEN' &&
			json.scope === 'SOME_SCOPE' &&
			json.token_type === 'Bearer'
		);
	});

	// Assess UI
	await page.waitForSelector('#authorization-code-data');
	expect(await getTextContent(page, '#authorization-code-data')).toBe(
		'{"code":"SOME_CODE","access_token":"SOME_ACCESS_TOKEN","expires_in":3600,"refresh_token":"SOME_REFRESH_TOKEN","scope":"SOME_SCOPE","token_type":"Bearer"}'
	);

	// Assess localStorage
	expect(
		await page.evaluate(() =>
			JSON.parse(
				window.localStorage.getItem(
					'code-http://localhost:3001/mock-authorize-SOME_CLIENT_ID-SOME_SCOPE'
				) || ''
			)
		)
	).toEqual({
		code: 'SOME_CODE',
		access_token: 'SOME_ACCESS_TOKEN',
		expires_in: 3600,
		refresh_token: 'SOME_REFRESH_TOKEN',
		scope: 'SOME_SCOPE',
		token_type: 'Bearer',
	});

	// Logout
	await page.click('#authorization-code-logout');
	expect(await page.$('#authorization-code-data')).toBe(null);
	expect(await page.$('#authorization-code-login')).not.toBe(null);
	expect(
		await page.evaluate(() =>
			window.localStorage.getItem(
				'code-http://localhost:3001/mock-authorize-SOME_CLIENT_ID-SOME_SCOPE'
			)
		)
	).toEqual('null');
});
