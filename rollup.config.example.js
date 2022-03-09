import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default [
	{
		input: 'src/example/index.ts',
		output: {
			file: 'dist/index.js',
			format: 'iife',
			sourcemap: true,
		},
		plugins: [
			replace({
				// process: JSON.stringify({ env: { NODE_ENV: 'development', tasos: 'yolo' } }),
				values: {
					'process.env.REACT_APP_CLIENT_ID': `'${process.env.REACT_APP_CLIENT_ID}'`,
					'process.env.REACT_APP_AUTHORIZE_URL': `'${process.env.REACT_APP_AUTHORIZE_URL}'`,
					'process.env.NODE_ENV': '"development"',
				},
			}),
			peerDepsExternal(),
			resolve(),
			commonjs(),
			typescript({ tsconfig: './tsconfig.json' }),
			serve({
				open: true,
				verbose: true,
				contentBase: ['', 'example'],
				host: 'localhost',
				port: 3000,
				historyApiFallback: true,
			}),
			livereload({ watch: 'dist' }),
		],
	},
];
