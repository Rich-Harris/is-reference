const assert = require('assert');
const { Parser } = require('acorn');
const injectClassFields = require('acorn-class-fields');
const injectStaticClassFeatures = require('acorn-static-class-features');
const parser = Parser.extend(injectClassFields, injectStaticClassFeatures);

const { walk } = require('estree-walker');

const isReference = require('../');

describe('is-reference', () => {
	const positive = {
		'simple identifier': `
			foo;`,

		'variable declaration': `
			var foo;`,

		'function name': `
			function foo () {}`,

		'function parameter': `
			function x ( foo ) {}`,

		'object pattern': `
			function x ({ foo }) {}`,

		'array pattern': `
			function x ([ foo ]) {}`,

		'assignment pattern': `
			function x ( foo = 1 ) {}`,

		'assignment pattern in object pattern': `
			function x ({ foo = 42 }) {}`,

		'member expression object': `
			foo.prop;`,

		'computed object literal property': `
			var obj = { [foo]: 1 };`,

		'object literal property value': `
			var obj = { bar: foo };`,

		'computed class field': `
			class Bar { [foo] = 1 };`,

		'class field value': `
			class Bar { bar = foo };`,
		};

	const negative = {
		'object literal property': `
			var obj = { foo: 1 };`,

		'member expression property': `
			obj.foo;`,

		'export-as': `
			var bar; export { bar as foo }`,

		'labeled break': `
		  foo: while (true) break foo;`,

		'labeled continue': `
			foo: while (true) continue foo;`,

		'imported': `
			import { foo as bar } from 'x';`,

		'class field': `
			class Bar { foo = 1; }`,
	};

	describe('positive', () => {
		Object.keys(positive).forEach(name => {
			it(name, () => {
				const code = positive[name];
				const matches = findFooReferences(code);

				assert.equal(matches.size, 1);
			});
		});

		it('handles standalone expressions, without a Program', () => {
			assert.ok(isReference({
				type: 'Identifier',
				name: 'foo'
			}))
		});
	});

	describe('negative', () => {
		Object.keys(negative).forEach(name => {
			it(name, () => {
				const code = negative[name];
				const matches = findFooReferences(code);

				assert.equal(matches.size, 0);
			});
		});
	});

	function findFooReferences(code) {
		const ast = parser.parse(code, {
			sourceType: 'module',
			ecmaVersion: 2020
		});

		const matches = new Set();

		walk(ast, {
			enter(node, parent) {
				const match = isReference(node, parent);
				assert.equal(typeof match, 'boolean');
				if (match && node.name === 'foo') {
					matches.add(node);
				}
			}
		});

		return matches;
	}
});
