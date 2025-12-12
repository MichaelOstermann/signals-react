import type { ArrowFunctionExpression, Expression, Function, JSXExpression, Node } from "oxc-parser"
import MagicString from "magic-string"
import { parseAndWalk } from "oxc-walker"
import { isReactIdentifier } from "./isReactIdentifier"

interface Scope {
    expressions: Set<JSXExpression | Expression>
    fn: Function | ArrowFunctionExpression
    react: boolean
}

export function transform(code: string, filename: string): MagicString {
    const ms = new MagicString(code, { filename })
    const ids = new Set<string>()
    let useSignal = ""
    let skip = 0
    const parents: Node[] = []
    const scopes: Scope[] = []
    const scopeStack: Scope[] = []

    function generateId(base: string): string {
        let count = 0
        while (ids.has(`${base}${count || ""}`)) count++
        const id = `${base}${count || ""}`
        ids.add(id)
        return id
    }

    function getUseSignal(): string {
        if (useSignal) return useSignal
        useSignal = generateId("useSignal")
        if (useSignal === "useSignal")
            ms.appendRight(0, `import { ${useSignal} } from "@monstermann/signals-react";\n`)
        else
            ms.appendRight(0, `import { useSignal as ${useSignal} } from "@monstermann/signals-react";\n`)
        return useSignal
    }

    parseAndWalk(code, filename, {
        enter(node, parent) {
            if (
                node.type === "FunctionDeclaration"
                || node.type === "FunctionExpression"
                || node.type === "ArrowFunctionExpression"
            ) {
                // function Component() {}
                // function useHook() {}
                if (
                    node.id
                    && node.id.type === "Identifier"
                    && isReactIdentifier(node.id.name)
                ) {
                    const scope: Scope = { expressions: new Set(), fn: node, react: true }
                    scopes.push(scope)
                    scopeStack.push(scope)
                }

                // const Component = function() {}
                // const useHook = function() {}
                else if (
                    parent?.type === "VariableDeclarator"
                    && parent.id.type === "Identifier"
                    && isReactIdentifier(parent.id.name)
                ) {
                    const scope: Scope = { expressions: new Set(), fn: node, react: true }
                    scopes.push(scope)
                    scopeStack.push(scope)
                }

                else {
                    const scope: Scope = { expressions: new Set(), fn: node, react: false }
                    scopes.push(scope)
                    scopeStack.push(scope)
                }
            }

            else if (node.type.startsWith("JSX")) {
                const scope = scopeStack.at(-1)
                if (scope) scope.react = true
            }

            else if (node.type === "ImportDeclaration") {
                if (node.source.value === "@monstermann/signals-react") {
                    for (const specifier of node.specifiers) {
                        if (
                            specifier.type === "ImportSpecifier"
                            && specifier.imported.type === "Identifier"
                            && specifier.imported.name === (useSignal || "useSignal")
                        ) {
                            useSignal = specifier.local.name
                        }
                    }
                }
            }

            else if (
                node.type === "CallExpression"
                && node.callee.type === "Identifier"
                && node.callee.name === useSignal
            ) {
                skip++
            }

            // $foo()
            // foo.$bar, foo.$bar()
            else if (
                !skip
                && (
                    // $foo()
                    (node.type === "CallExpression"
                        && node.arguments.length === 0
                        && node.callee.type === "Identifier"
                        && node.callee.name.startsWith("$"))
                    // foo.$bar, foo.$bar()
                    || (node.type === "MemberExpression"
                        && node.property.type === "Identifier"
                        && node.property.name.startsWith("$"))
                )
            ) {
                // The nearest function
                const scope = scopeStack.at(-1)
                // Try to find eg. the nearest variable such as const foo = ...,
                // we need to wrap the right side with const foo = useSignal(...)
                const target = findParent(parents, node => node.type === "VariableDeclaration" || node.type === "JSXExpressionContainer" || node.type === "JSXSpreadAttribute")
                if (scope && target?.type === "VariableDeclaration") {
                    for (const declaration of target.declarations) {
                        if (declaration.init) {
                            scope.expressions.add(declaration.init)
                        }
                    }
                }
                else if (scope && target?.type === "JSXExpressionContainer") {
                    scope.expressions.add(target.expression)
                }
                else if (scope && target?.type === "JSXSpreadAttribute") {
                    scope.expressions.add(target.argument)
                }
            }

            else if (node.type === "Identifier") {
                ids.add(node.name)
            }

            parents.push(node)
        },
        leave(node) {
            if (
                node.type === "CallExpression"
                && node.callee.type === "Identifier"
                && node.callee.name === useSignal
            ) {
                skip--
            }

            if (node === scopeStack.at(-1)?.fn) {
                scopeStack.pop()
            }

            parents.pop()
        },
    })

    for (const scope of scopes) {
        if (!scope.react) continue
        for (const expression of scope.expressions) {
            // useSignal(() => (expression))
            if (shouldWrap(expression)) {
                ms.appendRight(expression.start, `${getUseSignal()}(() => (`)
                ms.appendRight(expression.end, "))")
            }
            // useSignal(expression)
            else {
                ms.appendRight(expression.start, `${getUseSignal()}(`)
                ms.remove(expression.end - 2, expression.end - 1)
            }
        }
    }

    return ms
}

function shouldWrap(node: JSXExpression | Expression): boolean {
    // $foo()
    if (
        node.type === "CallExpression"
        && node.callee.type === "Identifier"
        && node.callee.name.startsWith("$")
    ) {
        return false
    }

    // foo.$bar()
    if (
        node.type === "CallExpression"
        && node.callee.type === "MemberExpression"
        && node.callee.property.type === "Identifier"
        && node.callee.property.name.startsWith("$")
    ) {
        return false
    }

    return true
}

function findParent<T extends Node>(parents: Node[], predicate: (node: Node) => node is T): T | undefined
function findParent(parents: Node[], predicate: (node: Node) => boolean): Node | undefined
function findParent(parents: Node[], predicate: (node: Node) => boolean): Node | undefined {
    let i = parents.length
    while (i--) {
        const node = parents[i]!
        if (node.type === "FunctionDeclaration") return undefined
        if (node.type === "FunctionExpression") return undefined
        if (node.type === "ArrowFunctionExpression") return undefined
        if (predicate(node)) return node
    }
    return undefined
}
