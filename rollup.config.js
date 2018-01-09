export default {
	input: 'src/index.js',
	output: [{
		file: 'dist/is-reference.js',
		format: 'umd',
		name: 'isReference'
	}, {
		file: 'dist/is-reference.es.js',
		format: 'es'
	}]
};
