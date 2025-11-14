export function isReactIdentifier(name: string): boolean {
    // PascalCase component name.
    if (/^[A-Z]/.test(name)) return true
    // useHook name.
    if (/^use[A-Z]/.test(name)) return true
    return false
}
