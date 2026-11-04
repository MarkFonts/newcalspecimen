"use client"

// Client boundary for components/CalAxes.tsx (section 05, one per "Variable Axis Animation" card).
//
// The cards pass CalAxes one per-breakpoint prop: the specimen size, 60pt at ≥1920 and
// 45pt everywhere else. The rest is fixed: padding 0 and the
// page foreground. React 19 ignores defaultProps on function components, so every prop
// CalAxes reads is passed here.
import { useSyncExternalStore } from "react"
import CalAxesSource from "@components/CalAxes"

const LARGE = "(min-width: 1920px)"

function subscribe(onChange: () => void) {
    const mq = window.matchMedia(LARGE)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
}

/** True in Framer's ≥1920 band. The server (and hydration) assume the 1200–1919 band. */
function useLargeDesktop() {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(LARGE).matches,
        () => false
    )
}

type Axis = "opsz" | "GEOM" | "wght" | "YTAS" | "SHRP" | "ital"

export function CalAxes({ axis, text }: { axis: Axis; text: string }) {
    const large = useLargeDesktop()
    return (
        <CalAxesSource
            axis={axis}
            text={text}
            fontSize={large ? 60 : 45}
            color="var(--foreground)"
            padding={0}
        />
    )
}
