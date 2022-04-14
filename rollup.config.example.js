import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import run from '@rollup/plugin-run';
import builtins from 'builtin-modules';

const commonPlugins = [
	replace({
		// process: JSON.stringify({ env: { NODE_ENV: 'development', tasos: 'yolo' } }),
		values: {
			'process.env.REACT_APP_CLIENT_ID': `'${process.env.REACT_APP_CLIENT_ID}'`,
			'process.env.REACT_APP_AUTHORIZE_URL': `'${process.env.REACT_APP_AUTHORIZE_URL}'`,
			'process.env.REACT_APP_SCOPE': `'${process.env.REACT_APP_SCOPE}'`,
			'process.env.AUTHORIZATION_SERVER_TOKEN_URL': `'${process.env.AUTHORIZATION_SERVER_TOKEN_URL}'`,
			'process.env.CLIENT_SECRET': `'${process.env.CLIENT_SECRET}'`,
			'process.env.NODE_ENV': '"development"',
		},
		preventAssignment: true,
	}),
	commonjs({
		ignoreDynamicRequires: true,
	}),
	resolve(),

	json(),
	typescript({ tsconfig: './tsconfig.json' }),
];

export default [
	{
		input: 'example/client/index.ts',
		output: {
			file: 'dist/browser.js',
			format: 'iife',
			sourcemap: true,
		},
		plugins: [
			...commonPlugins,
			serve({
				open: false,
				verbose: true,
				contentBase: ['.', './example/client'],
				host: 'localhost',
				port: 3000,
				historyApiFallback: true,
			}),
			livereload({ watch: 'dist' }),
		],
		external: builtins,
	},
	{
		input: 'example/server/index.ts',
		output: {
			inlineDynamicImports: true,
			file: 'dist/server.js',
			format: 'cjs',
			sourcemap: true,
		},
		plugins: [...commonPlugins, run()],
		external: builtins,
	},
];
