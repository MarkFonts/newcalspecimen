"use client"

import dynamic from "next/dynamic"
import type { ComponentType } from "react"

// For Framer components that can't render on the server at all: WebGL (AnimatedCal2),
// or anything that touches window / document / navigator when its module loads. The
// component is fetched and rendered in the browser only; the server sends `fallback`.
//
//   "use client"
//   import { clientOnly } from "@/lib/clientOnly"
//   export const AnimatedCal2 = clientOnly(() => import("@components/AnimatedCal2"))
//
// Call it at module scope in a "use client" file (next/dynamic with ssr: false is not
// allowed in server components). Give `fallback` the component's box size so the page
// doesn't jump when it mounts.
export function clientOnly<P extends object>(
    load: () => Promise<{ default: ComponentType<P> }>,
    fallback: ComponentType = () => null
) {
    const Fallback = fallback
    return dynamic(load, { ssr: false, loading: () => <Fallback /> })
}
