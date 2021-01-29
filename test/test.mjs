import acorn from 'acorn';
import injectClassFields from 'acorn-class-fields';
import injectStaticClassFeatures from 'acorn-static-class-features';
import { walk } from 'estree-walker';
import is_reference from '../src/index.js';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

const parser = acorn.Parser.extend(injectClassFields, injectStaticClassFeatures);

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

function findFooReferences(code) {
	const ast = parser.parse(code, {
		sourceType: 'module',
		ecmaVersion: 2020
	});

	const matches = new Set();

	walk(ast, {
		enter(node, parent) {
			const match = is_reference(node, parent);
			assert.equal(typeof match, 'boolean');
			if (match && node.name === 'foo') {
				matches.add(node);
			}
		}
	});

	return matches;
}

Object.keys(positive).forEach(name => {
	test(name, () => {
		const code = positive[name];
		const matches = findFooReferences(code);

		assert.equal(matches.size, 1);
	});
});

Object.keys(negative).forEach(name => {
	test(name, () => {
		const code = negative[name];
		const matches = findFooReferences(code);

		assert.equal(matches.size, 0);
	});
});

test('handles standalone expressions, without a Program', () => {
	assert.ok(is_reference({
		type: 'Identifier',
		name: 'foo'
	}))
});

test.run();