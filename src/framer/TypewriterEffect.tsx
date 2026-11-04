"use client"

import { useSyncExternalStore, type CSSProperties } from "react"
import TypewriterEffectSource from "@components/TypewriterEffect"

// Client boundary for components/TypewriterEffect.tsx (section 15, typer).
//
// The component is SSR-safe (timers start in effects; it renders an empty line on the
// server, as on the live page). Its loop runs forever, so under prefers-reduced-motion
// this wrapper shows the first word, typed out, with a still cursor instead.

const REDUCE = "(prefers-reduced-motion: reduce)"
const subscribe = (cb: () => void) => {
    const mq = matchMedia(REDUCE)
    mq.addEventListener("change", cb)
    return () => mq.removeEventListener("change", cb)
}
const useReducedMotion = () =>
    useSyncExternalStore(subscribe, () => matchMedia(REDUCE).matches, () => false)

type Props = {
    words: { word: string }[]
    typingSpeed: number
    deletingSpeed: number
    pauseDuration: number
    cursorColor: string
    cursorWidth: number
    cursorHeight: number
    font: CSSProperties
    textColor: string
}

export function TypewriterEffect(props: Props) {
    const reduce = useReducedMotion()
    if (!reduce) return <TypewriterEffectSource {...props} />
    // Same box as the component's outer span, frozen on the first word.
    const size = parseFloat(String(props.font.fontSize ?? 32))
    return (
        <span
            style={{
                ...props.font,
                color: props.textColor,
                display: "inline-flex",
                alignItems: "center",
                minWidth: 1,
                minHeight: 1,
                width: "max-content",
                height: "max-content",
                whiteSpace: "pre",
            }}
        >
            {props.words[0]?.word}
            <span
                aria-hidden="true"
                style={{
                    display: "inline-block",
                    background: props.cursorColor,
                    width: props.cursorWidth,
                    height: size * (props.cursorHeight / 100),
                    marginLeft: 2,
                    marginRight: 2,
                    verticalAlign: "bottom",
                    borderRadius: 2,
                }}
            />
        </span>
    )
}
