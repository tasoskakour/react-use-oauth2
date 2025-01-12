import puppeteer, { Browser } from 'puppeteer';
import { getTextContent, IS_RUNNING_IN_GITHUB_ACTIONS } from './test-utils';

const URL = 'http://localhost:3000';

let browser: Browser;
afterAll((done) => {
	browser.close();

	done();
});

test('Login with authorization code flow and exchangeCodeForQueryFn works as expected', async () => {
	browser = await puppeteer.launch(
		IS_RUNNING_IN_GITHUB_ACTIONS ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : {}
	);
	const page = await browser.newPage();

	await page.goto(URL);

	const nav = new Promise((response) => {
		browser.on('targetcreated', response);
	});

	await page.click('#authorization-code-queryfn-login');

	// Assess loading
	await page.waitForSelector('#authorization-code-queryfn-loading');

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

		return (
			urlPath === 'http://localhost:3001/mock-token-form-data' &&
			response.request().method().toUpperCase() === 'POST' &&
			response.request().postData() === 'code=SOME_CODE&someOtherData=someOtherData' &&
			json.code === 'SOME_CODE' &&
			json.access_token === 'SOME_ACCESS_TOKEN' &&
			json.expires_in === 3600 &&
			json.refresh_token === 'SOME_REFRESH_TOKEN' &&
			json.scope === 'SOME_SCOPE' &&
			json.token_type === 'Bearer'
		);
	});

	// Assess UI
	await page.waitForSelector('#authorization-code-queryfn-data');
	expect(await getTextContent(page, '#authorization-code-queryfn-data')).toBe(
		'{"code":"SOME_CODE","access_token":"SOME_ACCESS_TOKEN","expires_in":3600,"refresh_token":"SOME_REFRESH_TOKEN","scope":"SOME_SCOPE","token_type":"Bearer"}'
	);

	// Assess localStorage
	expect(
		await page.evaluate(() =>
			JSON.parse(
				window.localStorage.getItem(
					'code-http://localhost:3001/mock-authorize-SOME_CLIENT_ID_2-SOME_SCOPE'
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
	await page.click('#authorization-code-queryfn-logout');
	expect(await page.$('#authorization-code-queryfn-data')).toBe(null);
	expect(await page.$('#authorization-code-queryfn-login')).not.toBe(null);
	expect(
		await page.evaluate(() =>
			window.localStorage.getItem(
				'code-http://localhost:3001/mock-authorize-SOME_CLIENT_ID_2-SOME_SCOPE'
			)
		)
	).toEqual('null');
});
