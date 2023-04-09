import type { Config } from '@jest/types';

export default {
	preset: 'ts-jest/presets/js-with-ts',
	testEnvironment: 'jsdom',
	testMatch: ['<rootDir>/src/**/*.test.{js,jsx,ts,tsx}'],
	setupFiles: ['./setup-tests.unit.ts'],
} as Config.InitialOptions;
