const assert = require( 'assert' );
const { parse } = require( 'acorn' );
const { walk } = require( 'estree-walker' );

const isReference = require( '../' );

describe( 'is-reference', () => {
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
			function x ({ foo = 42 }) {}`
	};

	const negative = {
		'object literal property': `
			var obj = { foo: 1 };`,

		'member expression property': `
			obj.foo;`
	};

	describe( 'positive', () => {
		Object.keys( positive ).forEach( name => {
			it( name, () => {
				const code = positive[ name ];
				const matches = findFooReferences( code );

				assert.equal( matches.size, 1 );
			});
		});
	});

	describe( 'negative', () => {
		Object.keys( negative ).forEach( name => {
			it( name, () => {
				const code = negative[ name ];
				const matches = findFooReferences( code );

				assert.equal( matches.size, 0 );
			});
		});
	});

	function findFooReferences ( code ) {
		const ast = parse( code );

		const matches = new Set;

		walk( ast, {
			enter ( node, parent ) {
				if ( isReference( node, parent ) && node.name === 'foo' ) {
					matches.add( node );
				}
			}
		});

		return matches;
	}
});
