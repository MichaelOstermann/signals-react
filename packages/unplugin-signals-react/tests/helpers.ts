import redent from "redent"
import { expect } from "vitest"
import { transform } from "../src/transformer"

export function expectSnapshot(code: string): void {
    expect(transform(redent(code).trim(), "source.jsx").toString())
        .toMatchSnapshot()
}
