// eslint-disable-next-line unicorn/prefer-module
module.exports = {
	globals: {
		// See reference: https://kulshekhar.github.io/ts-jest/docs/getting-started/options/tsconfig
		'ts-jest': {
			tsconfig: 'tsconfig.json',
		},
	},
	preset: 'jest-puppeteer',
	setupFiles: ['./setup-tests.js'],
};
