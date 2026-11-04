"use client"

// Framer's appear effect on scroll-container's text blocks 1 and 2
//: the block's text is at full opacity
// while its 100vh block is in view and drops to 0.3 when it isn't, both ways, every
// time, with Framer's spring {bounce 0.2, duration 0.4}.
//
// Framer's trigger is threshold 1 on a block exactly as tall as the viewport. That can
// only be met at the exact pixel of alignment, and on the live page it never fires: the
// text stays at opacity 1 at every scroll position (measured 2026-11-02 in headless
// Chrome and in a real Chrome window). The port uses the effect's evident intent with a
// trigger that can actually happen: a block counts as "in view" while it covers at least
// half the viewport (IN_VIEW). Exactly one block is lit at a time, and a text dims as
// it slides up under the pinned word-mark. Set IN_VIEW to 1 for Framer's literal
// (never-firing) behavior.
import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion } from "framer-motion"

const IN_VIEW = 0.5
const SPRING = { type: "spring", bounce: 0.2, duration: 0.4, delay: 0 } as const

export function ScrollDim({ className, children }: { className?: string; children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null)
    const [lit, setLit] = useState(true)

    useEffect(() => {
        // Observe the 100vh block this wrapper sits in (Framer's target `ref`).
        const block = ref.current?.parentElement
        if (!block || typeof IntersectionObserver === "undefined") return
        const io = new IntersectionObserver(
            ([e]) => {
                // The block is exactly 100vh, so its ratio is the share of the viewport it covers.
                const ratio = e.intersectionRect.height / Math.max(1, e.rootBounds?.height ?? innerHeight)
                setLit(ratio >= IN_VIEW - 0.001)
            },
            { threshold: [0, 0.25, IN_VIEW - 0.01, IN_VIEW, IN_VIEW + 0.01, 0.75, 1] }
        )
        io.observe(block)
        return () => io.disconnect()
    }, [])

    return (
        <motion.div ref={ref} className={className} initial={false} animate={{ opacity: lit ? 1 : 0.3 }} transition={SPRING}>
            {children}
        </motion.div>
    )
}
