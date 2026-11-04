"use client"

// Framer's design component "Blur-text 2" (spec 09): one word that blurs and sharpens
// by itself, 2 s blurred, 2 s sharp, forever, starting blurred. Every switch runs the
// component's own transition, a spring { duration: 0.4, bounce: 0.2 }.
//
// Not one of the repo's code components (Framer compiled it from a design component), so
// it is rebuilt here. The blur radius and the word size differ per breakpoint; both come
// from CSS (the section passes the classes), so the server render already matches every
// width. framer-motion springs a 0→1 progress value written as --blur-p, and the filter
// is blur(--blur × --blur-p), floored at 0 so the spring's overshoot reads as sharp.
//
// prefers-reduced-motion: the word holds sharp and the timer never starts.

import type React from "react"
import { useEffect, useState } from "react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion"

const HOLD_MS = 2000
const SPRING = { type: "spring", duration: 0.4, bounce: 0.2 } as const

export function BlurText({
    text,
    className = "",
    style,
}: {
    text: string
    className?: string
    style?: React.CSSProperties
}) {
    const reduce = useReducedMotion()
    const [blurred, setBlurred] = useState(true)
    const p = useMotionValue(1)
    // The spring drives `p`, which no element owns; the style gets a derived copy. Bound
    // to the element itself, animate() would resolve the CSS variable's keyframes from
    // the DOM and fail on the string it reads back.
    const pStyle = useTransform(p, (v) => v)

    // The variant timer: each state holds 2 s, then flips. A flip cancels the pending one.
    useEffect(() => {
        if (reduce) return
        const id = setTimeout(() => setBlurred((b) => !b), HOLD_MS)
        return () => clearTimeout(id)
    }, [blurred, reduce])

    useEffect(() => {
        if (reduce) {
            p.jump(0)
            return
        }
        const controls = animate(p, blurred ? 1 : 0, SPRING)
        return () => controls.stop()
    }, [blurred, reduce, p])

    return (
        <motion.div
            data-framer-name="Blur"
            className={`w-full text-center leading-[1.2] whitespace-nowrap [filter:blur(max(0px,calc(var(--blur)*var(--blur-p))))] motion-reduce:[filter:none] ${className}`}
            style={{ ...style, "--blur-p": pStyle } as never}
        >
            {text}
        </motion.div>
    )
}
