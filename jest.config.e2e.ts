/* eslint-disable unicorn/prevent-abbreviations */
import type { Config } from '@jest/types';

export default {
	preset: 'jest-puppeteer',
	testMatch: ['<rootDir>/e2e/**/*.test.{js,jsx,ts,tsx}'],
} as Config.InitialOptions;
