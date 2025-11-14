import { defineConfig } from "tsdown"

export default defineConfig({
    clean: true,
    dts: true,
    entry: ["src/*.ts"],
    external: ["@monstermann/signals-react"],
    format: ["esm", "cjs"],
})
