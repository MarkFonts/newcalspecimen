"use client"

// Client boundary for components/HOIGrid.tsx (spec 10).
//
// React 19 ignores defaultProps on function components, so the component's own defaults
// are spread in here first, then the instance's props.
//
// prefers-reduced-motion: the grid starts paused (a click on it still resumes, as the
// component allows) and the ping rings hold still; see the section's CSS.
import type { ComponentProps } from "react"
import { useEffect, useState } from "react"
import HOIGridSource from "@components/HOIGrid"

type Props = ComponentProps<typeof HOIGridSource>

export function HOIGrid(props: Props) {
    const defaults = (HOIGridSource as { defaultProps?: Props }).defaultProps ?? {}
    const [reduce, setReduce] = useState(false)
    useEffect(() => {
        const mq = matchMedia("(prefers-reduced-motion: reduce)")
        setReduce(mq.matches)
        const on = () => setReduce(mq.matches)
        mq.addEventListener("change", on)
        return () => mq.removeEventListener("change", on)
    }, [])
    return <HOIGridSource {...defaults} {...props} paused={reduce || props.paused} />
}
