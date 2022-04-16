import puppeeteer from 'puppeteer';

export const getTextContent = (page: puppeeteer.Page, selector: string) =>
	page.$eval(selector, (element) => element.textContent);
