import typescript from 'rollup-plugin-typescript';

export default {
	input: 'src/index.ts',
	output: [{
		file: 'dist/is-reference.js',
		format: 'umd',
		name: 'isReference'
	}, {
		file: 'dist/is-reference.es.js',
		format: 'es'
	}],
	plugins: [
		typescript({
			typescript: require('typescript')
		})
	]
};
