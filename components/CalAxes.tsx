import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef } from "react"
import {
    motion,
    useMotionValue,
    useTransform,
    useAnimationFrame,
} from "framer-motion"
import { calFont, buildFontFaceCSS, FONT_CONTROLS, ytasCss, type CalFont } from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"

// ─────────────────────────────────────────────────────────────────────────────
// CalAxes.tsx — Cal Sans 2 single-axis animator.
//
// Pick ONE axis; it eases 0% → 100% of its range in 0.8s, holds 0.2s, eases back to
// 0% in 0.8s, holds 0.2s (easy-ease in+out, NO spring), forever. Phase is a GLOBAL clock
// (performance.now()), so multiple instances — each on a different axis — stay in
// perfect lockstep no matter when they mount. Drop 3+ on a page for a synced combo.
//
// (The per-axis sliders are commented out below — you can't tween a static prop in a
// code component, so the live-animated `axis` dropdown replaces them.)
// ─────────────────────────────────────────────────────────────────────────────

const STYLE_ID = "calaxes-css"

function injectFont(ver: CalFont) {
    if (typeof document === "undefined") return
    const id = `${STYLE_ID}-${ver.family}`
    if (document.getElementById(id)) return
    const el = document.createElement("style")
    el.id = id
    el.textContent = buildFontFaceCSS(ver)
    document.head.appendChild(el)
}

// Axis tag → [min, max] (0% → 100%). The non-animated axes rest at DEFAULTS.
const RANGES: Record<string, [number, number]> = {
    opsz: [8, 45],
    GEOM: [0, 100],
    wght: [400, 700],
    YTAS: [720, 800],
    SHRP: [0, 100],
    ital: [0, 1],
}
const DEFAULTS = { opsz: 14, GEOM: 25, wght: 400, YTAS: 720, SHRP: 0, ital: 0 }

// Cubic ease-in-out ("easy ease"): zero velocity at 0 and 1 → smooth turnarounds.
const easeInOut = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const MOVE = 800 // ease duration per leg (each path movement)
const HOLD = 200 // pause at each end after a movement
const CYCLE = 2 * (MOVE + HOLD) // 0.8 move + 0.2 hold, up then down = 2s

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function CalAxes(props: any) {
    const { text, fontSize, axis, color, padding, style } = props
    const ver = calFont(props)

    useEffect(() => {
        injectFont(ver)
    }, [ver.family])

    const [min, max] = RANGES[axis] || RANGES.opsz
    const val = useMotionValue(min)

    // Global-clock ping-pong: every instance reads the same performance.now(), so they
    // animate in sync regardless of mount time. No React re-renders (motion value).
    // Off screen nothing is written: the callback returns early (a ref, so the hook
    // never re-subscribes). The clock is global, so the first frame back is current.
    const rootRef = useRef<HTMLDivElement>(null)
    const onScreenRef = useRef(true)
    useEffect(() => {
        const el = rootRef.current
        if (!el || typeof IntersectionObserver === "undefined") return
        const io = new IntersectionObserver(([e]) => {
            onScreenRef.current = e.isIntersecting
        })
        io.observe(el)
        return () => io.disconnect()
    }, [])
    useAnimationFrame(() => {
        if (!onScreenRef.current) return
        const t = performance.now() % CYCLE // 0..CYCLE
        let prog: number
        if (t < MOVE) prog = easeInOut(t / MOVE) // 0 → 1 (0.8s up)
        else if (t < MOVE + HOLD) prog = 1 // hold at 100% (0.2s)
        else if (t < 2 * MOVE + HOLD)
            prog = easeInOut(1 - (t - MOVE - HOLD) / MOVE) // 1 → 0 (0.8s down)
        else prog = 0 // hold at 0% (0.2s)
        val.set(min + prog * (max - min))
    })

    const italStyle = useTransform(val, (v) =>
        axis === "ital" && v >= 0.5 ? "italic" : "normal"
    )
    const fvs = useTransform(val, (v) => {
        const a: Record<string, number> = { ...DEFAULTS, [axis]: v }
        // Never emit opsz exactly 14. When every axis sits on its default (the 0% hold
        // of the wght / YTAS / SHRP / ital cards), Safari drops the whole list, and under
        // withCalSans' forced `auto` it then sizes opsz from the font size: a one-frame
        // flash ~12% narrower. 14.001 renders identically and is never "all default".
        const opsz = a.opsz === 14 ? 14.001 : a.opsz
        return `"opsz" ${opsz}, "GEOM" ${a.GEOM}, "wght" ${a.wght}, "YTAS" ${ytasCss(a.YTAS)}, "SHRP" ${a.SHRP}, "ital" ${a.ital}`
    })

    return (
        <motion.div
            ref={rootRef}
            style={{
                ...style,
                display: "inline-block",
                overflow: "visible", // never clip glyphs
                padding, // breathing room so overhang isn't cut by the frame
                fontFamily: `"${ver.family}", sans-serif`,
                fontSize: fontSize / 0.75, // Size is in POINTS → px is ÷0.75
                fontOpticalSizing: "none", // opsz comes from the animation, not the size
                fontStyle: italStyle, // the cossui build italicises by file, not by the ital axis
                fontVariationSettings: fvs,
                color,
                lineHeight: 1.2,
                whiteSpace: "pre",
            }}
        >
            {text}
        </motion.div>
    )
}

CalAxes.defaultProps = {
    text: "Cal Sans",
    fontSize: 90,
    axis: "opsz",
    color: "#111111",
    padding: 24,
    // Commented out — per-axis resting values (a static prop can't tween in a code
    // component; the animated `axis` dropdown replaces the sliders):
    // opsz: 14, geom: 25, wght: 400, ytas: 720, shrp: 0, ital: 0,
}

addPropertyControls(CalAxes, {
    ...FONT_CONTROLS,
    text: { type: ControlType.String, title: "Text", defaultValue: "Cal Sans" },
    fontSize: {
        type: ControlType.Number,
        title: "Size",
        defaultValue: 90,
        min: 6,
        max: 600,
        step: 1,
        unit: "pt",
    },
    axis: {
        type: ControlType.Enum,
        title: "Axis",
        options: ["opsz", "GEOM", "wght", "YTAS", "SHRP", "ital"],
        optionTitles: [
            "Optical Size",
            "Geometric Form",
            "Weight",
            "Ascender Height",
            "Sharp",
            "Italic",
        ],
        defaultValue: "opsz",
    },
    color: { type: ControlType.Color, title: "Color", defaultValue: "#111111" },
    padding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: 24,
        min: 0,
        max: 200,
        step: 1,
        unit: "px",
    },
    // ── Commented out: variable-axis sliders — incompatible with code-component
    // ── rendering (no tween on a static prop). Kept for reference / manual use.
    // opsz: { type: ControlType.Number, title: "opsz", defaultValue: 14, min: 8, max: 45, step: 0.1 },
    // geom: { type: ControlType.Number, title: "GEOM", defaultValue: 25, min: 0, max: 100, step: 1 },
    // wght: { type: ControlType.Number, title: "wght", defaultValue: 400, min: 400, max: 700, step: 1 },
    // ytas: { type: ControlType.Number, title: "YTAS", defaultValue: 720, min: 720, max: 800, step: 1 },
    // shrp: { type: ControlType.Number, title: "SHRP", defaultValue: 0, min: 0, max: 100, step: 1 },
    // ital: { type: ControlType.Number, title: "ital", defaultValue: 0, min: 0, max: 1, step: 0.01 },
})
