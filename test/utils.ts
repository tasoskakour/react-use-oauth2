import { Page } from 'puppeteer';

export const getTextContent = (page: Page, selector: string) =>
	page.$eval(selector, (element) => element.textContent);
