import type { FilterPattern } from "unplugin"

export interface SignalsReactPluginOptions {
    enforce?: "post" | "pre" | undefined
    exclude?: FilterPattern
    include?: FilterPattern
}
