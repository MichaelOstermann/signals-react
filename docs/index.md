---
aside: true
---

# signals-react

<Badge type="info" class="size">
    <span>Minified</span>
    <span>432 B</span>
</Badge>

<Badge type="info" class="size">
    <span>Minzipped</span>
    <span>257 B</span>
</Badge>

**React integration for @monstermann/signals.**

## Installation

::: code-group

```sh [npm]
npm install @monstermann/signals-react
```

```sh [pnpm]
pnpm add @monstermann/signals-react
```

```sh [yarn]
yarn add @monstermann/signals-react
```

```sh [bun]
bun add @monstermann/signals-react
```

:::

## Usage

```ts
import { useSignal } from "@monstermann/signals-react";

export function Component() {
    const a = useSignal(signal);
    const b = useSignal(memo);
    const c = useSignal(reducer);
    // Plain functions will get wrapped with a `memo()`
    const d = useSignal(() => {});
}
```

## unplugin-signals-react

Alternatively you can use an [unplugin](https://github.com/unjs/unplugin) that uses the [Oxidation Compiler](https://oxc.rs/) which automatically wraps signals with `useSignal` for you - the only prerequisite is that you prefix your signals with `$`:

::: code-group

```tsx [Before]
export function Component({ className }) {
    const style = $style();
    return (
        <div style={style} className={$class() + className}>
            {$content()}
        </div>
    );
}
```

```tsx [After]
export function Component({ className }) {
    const style = useSignal($style);
    return (
        <div style={style} className={useSignal(() => $class() + className)}>
            {useSignal($content)}
        </div>
    );
}
```

:::

### Installation

::: code-group

```sh [npm]
npm install -D @monstermann/signals-react
```

```sh [pnpm]
pnpm -D add @monstermann/signals-react
```

```sh [yarn]
yarn -D add @monstermann/signals-react
```

```sh [bun]
bun -D add @monstermann/signals-react
```

:::

### Usage

::: code-group

```ts [Vite]
// vite.config.ts
import signals from "@monstermann/signals-react/vite";

export default defineConfig({
    plugins: [signals()],
});
```

```ts [Rollup]
// rollup.config.js
import signals from "@monstermann/signals-react/rollup";

export default {
    plugins: [signals()],
};
```

```ts [Rolldown]
// rolldown.config.js
import signals from "@monstermann/signals-react/rolldown";

export default {
    plugins: [signals()],
};
```

```ts [Webpack]
// webpack.config.js
const signals = require("@monstermann/signals-react/webpack");

module.exports = {
    plugins: [signals()],
};
```

```ts [Rspack]
// rspack.config.js
const signals = require("@monstermann/signals-react/rspack");

module.exports = {
    plugins: [signals()],
};
```

```ts [ESBuild]
// esbuild.config.js
import { build } from "esbuild";
import signals from "@monstermann/signals-react/esbuild";

build({
    plugins: [signals()],
});
```

:::
