import { defineConfig } from "tsdown"

export default defineConfig({
    clean: true,
    deps: { neverBundle: ["vite", "@monstermann/signals-react"] },
    dts: true,
    entry: ["src/*.ts"],
    format: ["esm", "cjs"],
})
