import { describe, test } from "vitest"
import { expectSnapshot } from "./helpers"

describe("transform", () => {
    test("Should transform const Component = function() {}", () => {
        expectSnapshot(`
            export const Component = function() {
                const foo = $foo()
                return null
            }
        `)
    })

    test("Should transform function Component() {}", () => {
        expectSnapshot(`
            export function Component() {
                const foo = $foo()
                return null
            }
        `)
    })

    test("Should transform const Component = () => {}", () => {
        expectSnapshot(`
            export const Component = () => {
                const foo = $foo()
                return null
            }
        `)
    })

    test("Should transform functions containing jsx", () => {
        expectSnapshot(`
            export const component = () => {
                const foo = $foo()
                return <div />
            }
        `)
    })

    test("Should transform const useHook = function() {}", () => {
        expectSnapshot(`
            export const useHook = function() {
                const foo = $foo()
                return null
            }
        `)
    })

    test("Should transform function useHook() {}", () => {
        expectSnapshot(`
            export function useHook() {
                const foo = $foo()
                return null
            }
        `)
    })

    test("Should transform const useHook = () => {}", () => {
        expectSnapshot(`
            export const useHook = () => {
                const foo = $foo()
                return null
            }
        `)
    })

    test("Should ignore everything else", () => {
        expectSnapshot(`
            export const component = () => {
                const foo = $foo()
                return foo
            }
        `)
    })

    test("Should transform nested call expressions", () => {
        expectSnapshot(`
            export const useHook = () => {
                const foo = bar.$baz()
                return null
            }
        `)
    })

    test("Should transform complex expressions", () => {
        expectSnapshot(`
            export const useHook = () => {
                const a = $a() + $b()
                const b = { b: $b() }
                const c = [$c()]
                const d = util($d())
                return null
            }
        `)
    })

    test("Should transform JSX attributes", () => {
        expectSnapshot(`
            export const Component = () => {
                return (
                    <div style={$style()} />
                )
            }
        `)
    })

    test("Should transform JSX spread attributes", () => {
        expectSnapshot(`
            export const Component = () => {
                return (
                    <div {...$style()} />
                )
            }
        `)
    })

    test("Should transform JSX container expressions", () => {
        expectSnapshot(`
            export const Component = () => {
                return (
                    <div>
                        {$text()}
                    </div>
                )
            }
        `)
    })

    test("Should ignore non-reads", () => {
        expectSnapshot(`
            export const Component = () => {
                const foo = $foo(100)
                return null
            }
        `)
    })

    test("Should ignore already decorated signals", () => {
        expectSnapshot(`
            import { useSignal as useS } from "@monstermann/signals-react"
            export const Component = () => {
                const foo = useS($foo)
                return null
            }
        `)
    })

    test("Should reuse import", () => {
        expectSnapshot(`
            import { useSignal as useS } from "@monstermann/signals-react"
            export const Component = () => {
                const foo = $foo()
                return null
            }
        `)
    })
})
