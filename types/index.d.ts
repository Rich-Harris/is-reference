import type { Node } from 'estree';

export type NodeWithPropertyDefinition = Node | {
    type: 'PropertyDefinition';
    computed: boolean;
    value: Node;
};

/**
 * Utility for determining whether an AST node is a reference.
 *
 * foo is a reference in these cases:
 * 
 * console.log(foo);
 * var foo;
 * function foo() {}
 * function bar(foo) {}
 * export { foo as x };
 * 
 * foo is not a reference in these cases:
 *
 * var obj = { foo: 1 };
 * console.log(obj.foo);
 * export { x as foo };
 *
 * In all cases, foo is an Identifier node, but the two kinds must be treated differently for the purposes of scope analysis etc.
 * (The examples are non-exhaustive.)
 */
export default function is_reference(node: NodeWithPropertyDefinition, parent: NodeWithPropertyDefinition): boolean;
