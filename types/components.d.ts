// Types for the Framer component sources, imported as @components/<File> (webpack alias in
// next.config.ts → components/<File>.tsx).
//
// The sources are written for Framer's editor, not for a strict type check: untyped
// props, CSSProperties built from plain strings, and so on (about 70 errors across
// them). They are kept as written for Framer, so the
// type checker is kept out of them: every component is a loosely typed React component
// here, and its props are whatever its spec lists. Shared and SharedTester do type-check,
// so tsconfig paths point at the real files for those two.

declare module "@components/*" {
    import type { ComponentType } from "react"
    const Component: ComponentType<any>
    export default Component
}

// Code overrides: these take a component and return a wrapped one.
declare module "@components/WithCalFit" {
    import type { ComponentType } from "react"
    export function withCalFitReceiver<P>(Component: ComponentType<P>): ComponentType<P>
}
declare module "@components/WithCalSans" {
    import type { ComponentType } from "react"
    export function withCalSans<P>(Component: ComponentType<P>): ComponentType<P>
    export function withCalSansItalic<P>(Component: ComponentType<P>): ComponentType<P>
}
