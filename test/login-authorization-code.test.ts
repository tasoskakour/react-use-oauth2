import puppeteer from 'puppeteer';
import { getTextContent } from './utils';

const URL = 'http://localhost:3000';

/*

https://some-authorize-url.com?response_type=code&client_id=some-client-id&redirect_uri=http://localhost:3000/callback&scope=some-scope&state=some-state
*/

let browser: puppeteer.Browser;
afterAll((done) => {
	browser.close();

	done();
});

test('Login with authorization code works as expected', async () => {
	browser = await puppeteer.launch({
		dumpio: true,
		headless: false,
		slowMo: 2000,
	});
	const page = await browser.newPage();
	await page.setRequestInterception(true);

	page.on('request', (request) => {
		// TODO: match request.url()
		console.log('REQUEST', request.url());
		// console.log(request._response.bo)

		// request.respond({
		// 	// contentType:''
		// 	// headers: { 'Access-Control-Allow-Origin': '*' },
		// 	body: JSON.stringify({ foo: 'bar' }),

		// });
	});
	await page.goto(URL);

	// simulate popup callback redirect
	page.on('popup', (popup) => {
		console.log('going to popup');
		// popup.goto('http://localhost:3000/callback?state=some-state&code=some-code');
	});

	await page.click('#login-with-authorization-code');

	await page.waitForTimeout(4000);

	// expect(await getTextContent(page, '')).toBe('Login with Authorization Code');
});
