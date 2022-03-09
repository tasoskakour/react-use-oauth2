/* eslint-disable unicorn/prefer-module */
module.exports = {
	extends: ['tasoskakour-typescript-prettier/with-react'],
	ignorePatterns: ['dist', 'coverage'],
	rules: {
		// your overrides
		'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
	},
};
