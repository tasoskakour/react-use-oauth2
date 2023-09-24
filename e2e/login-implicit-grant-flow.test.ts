import puppeteer, { Browser } from 'puppeteer';
import { getTextContent } from './test-utils';

const URL = 'http://localhost:3000';

let browser: Browser;
afterAll((done) => {
	browser.close();

	done();
});

test('Login with implicit grant flow works as expected', async () => {
	browser = await puppeteer.launch({ headless: 'new' });
	const page = await browser.newPage();

	await page.goto(URL);

	const nav = new Promise((response) => {
		browser.on('targetcreated', response);
	});

	await page.click('#implicit-grant-login');

	// Assess loading
	await page.waitForSelector('#implicit-grant-loading');

	// Assess popup redirection
	await nav;
	const pages = await browser.pages();

	expect(pages[2].url()).toMatch(
		/http:\/\/localhost:3000\/callback\?access_token=SOME_ACCESS_TOKEN&token_type=Bearer&expires_in=3600&state=.*\S.*/ // any non-empty state
	);

	// Assess UI
	await page.waitForSelector('#implicit-grant-data');
	expect(await getTextContent(page, '#implicit-grant-data')).toMatch(
		/{"access_token":"SOME_ACCESS_TOKEN","token_type":"Bearer","expires_in":"3600","state":.*\S.*}/
	);

	// Assess localStorage
	expect(
		await page.evaluate(() =>
			JSON.parse(
				window.localStorage.getItem(
					'token-http://localhost:3001/mock-authorize-SOME_CLIENT_ID-SOME_SCOPE'
				) || ''
			)
		)
	).toEqual({
		access_token: 'SOME_ACCESS_TOKEN',
		expires_in: '3600',
		state: expect.anything(),
		token_type: 'Bearer',
	});

	// Logout
	await page.click('#implicit-grant-logout');
	expect(await page.$('#implicit-grant-data')).toBe(null);
	expect(await page.$('#implicit-grant-login')).not.toBe(null);
	expect(
		await page.evaluate(() =>
			window.localStorage.getItem(
				'token-http://localhost:3001/mock-authorize-SOME_CLIENT_ID-SOME_SCOPE'
			)
		)
	).toEqual('null');
});
