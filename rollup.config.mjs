import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';
import packageJson from './package.json' assert { type: 'json' };

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				file: packageJson.main,
				format: 'cjs',
				sourcemap: false,
			},
			{
				file: packageJson.module,
				format: 'esm',
				sourcemap: false,
			},
		],
		plugins: [
			del({ targets: 'dist/*' }),
			peerDepsExternal(),
			resolve(),
			commonjs(),
			typescript({ tsconfig: './tsconfig.json', include: ['./src/components/**'] }),
			terser(),
		],
	},
	{
		input: 'dist/esm/types/index.d.ts',
		output: [{ file: 'dist/index.d.ts', format: 'esm', sourcemap: false }],
		plugins: [dts()],
	},
];
