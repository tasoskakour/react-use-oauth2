import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import run from '@rollup/plugin-run';
import builtins from 'builtin-modules';

const commonPlugins = [
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
