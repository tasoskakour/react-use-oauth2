import { Page } from 'puppeteer';

export const getTextContent = (page: Page, selector: string) =>
	page.$eval(selector, (element) => element.textContent);

export const IS_RUNNING_IN_GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === 'true';
