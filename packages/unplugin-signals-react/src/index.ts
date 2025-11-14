import type { SignalsReactPluginOptions } from "./types"
import { createUnplugin } from "unplugin"
import { transform } from "./transformer"

export default createUnplugin<SignalsReactPluginOptions>(({
    enforce,
    exclude,
    include,
} = {}) => {
    return {
        enforce,
        name: "unplugin-signals-react",
        transform: {
            filter: {
                id: {
                    exclude,
                    include: include || [/\.[jt]sx?$/],
                },
            },
            handler(code, id) {
                const ms = transform(code, id)
                if (!ms.hasChanged()) return

                return {
                    code: ms.toString(),
                    get map() {
                        return ms.generateMap({
                            hires: "boundary",
                            includeContent: true,
                            source: id,
                        })
                    },
                }
            },
        },
    }
})
