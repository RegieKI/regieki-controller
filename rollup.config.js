import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import preprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import path from 'path';


const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/App.js',
	output: {
		file: 'public/bundle.js',
		format: 'iife',
		name: 'app',
		sourcemap: false
	},
	plugins: [
		alias({
			resolve: ['.js', '.svelte'],
			entries: [ { find: '@', replacement: path.resolve(__dirname, 'src') } ]
		}),
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs(),
		svelte({
			preprocess: preprocess(),
			dev: !production,
			css: css => {
				css.write('bundle.css');
			}
		}),
		typescript({ sourceMap: !production }),
		production && terser()
	],
	watch: {
		clearScreen: false
	},
}
