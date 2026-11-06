import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, useAnimation } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import {
    calFont,
    FONT_CONTROLS,
    buildFontFaceCSS,
    readFontRevision,
    AXIS_RANGES,
    ytasCss,
} from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"
import {
    AXIS_META,
    SAMPLE_TEXT,
} from "https://framer.com/m/SharedTester-SB64gG.js@Dd5hSuq9KXwyNAlMQCX7"

// ─────────────────────────────────────────────────────────────────────────────
// KaossTester — mobile "option 2": one square BOARD (capped at 1/3 vh) with equal
// title-margins on all sides. Resting, the inner area is subdivided into 4 quad pads
// with a central label gutter; tap a quad and it expands to fill that same inner area
// (a KORG-Kaossilator XY pad), drag the dot, tap a margin to dismiss. Each quad maps
// X→one axis, Y→another (8 axes total).
//
// Font machinery + version toggle/badge from Shared.tsx; axis RANGES from
// Shared.AXIS_RANGES; axis labels/units/stops + SAMPLE_TEXT from SharedTester.tsx; the
// dirty-state reset is ported from CustomTypeTester.
// ─────────────────────────────────────────────────────────────────────────────

// Build each axis from the shared sources: ranges from Shared.AXIS_RANGES (font axes)
// or AXIS_META (the CSS pseudo-axes size/tracking), labels/units/stops from AXIS_META.
// (AXIS_RANGES keys GEOM/YTAS/SHRP are upper-case; our value keys are lower-case.)
const RANGE_KEY = { geom: "GEOM", ytas: "YTAS", shrp: "SHRP" }
const axis = (key) => {
    const m = AXIS_META[key]
    const r = AXIS_RANGES[RANGE_KEY[key] || key]
    return {
        key,
        label: m.label,
        unit: m.unit,
        stops: m.stops,
        min: r ? r.min : m.min,
        max: r ? r.max : m.max,
    }
}

// X axis + Y axis per quad (8 axes total).
const QUADS = [
    { x: axis("opsz"), y: axis("wght") },
    { x: axis("spacing"), y: axis("size") },
    { x: axis("shrp"), y: axis("ytas") },
    { x: axis("geom"), y: axis("ital") },
]

const DEFAULTS = {
    opsz: 14,
    wght: 400,
    spacing: 0,
    size: 96,
    shrp: 0,
    ytas: 720,
    geom: 25,
    ital: 0,
}

// Board geometry (all % of the square board). The outer title-margin and the central
// gutter are the SAME value — both just hold one axis-name label, so keeping them equal
// makes the layout uniform (one knob, `M`). Q = quadrant size; INNER = expanded pad.
const M = 12 // outer margin == central gutter
const G = M
const Q = (100 - 2 * M - G) / 2
const QUAD_POS = [
    { left: M, top: M, size: Q }, // TL
    { left: M + Q + G, top: M, size: Q }, // TR
    { left: M, top: M + Q + G, size: Q }, // BL
    { left: M + Q + G, top: M + Q + G, size: Q }, // BR
]
const INNER = { left: M, top: M, size: 100 - 2 * M }

// Inset the EXPANDED pad's usable range on each edge (fraction of the pad) so the 34px
// dot sits fully on-pad and the min/max stops pull off the corners — the Y-axis ticks
// stop crossing the X-axis ticks. Dot + stops + drag all use this, so they stay aligned.
// Resting quads pass 0 (no inset). Needs to clear the ~20px-wide stop labels, so the
// corner X-min and Y-max ticks don't collide — 0.13 is the floor for that on a phone.
const PAD_INSET = 0.13
// Resting quads have no stops, so the small dot only needs enough inset to not hang off
// its quad. It's a FRACTION of the quad (which scales with the board), so the indent
// stays proportional at any size — the 13px dot on a quad ≈ the 34px dot on the inner pad.
const RESTING_INSET = 0.06
const alongAxis = (start, size, frac, ins) =>
    start + (ins + frac * (1 - 2 * ins)) * size

const fracOf = (v, axis) => (v[axis.key] - axis.min) / (axis.max - axis.min)
const stopPos = (s, axis) => (s - axis.min) / (axis.max - axis.min)
const clamp01 = (n) => Math.min(1, Math.max(0, n))
const fmtVal = (v, axis) =>
    `${axis.min >= 0 && axis.max <= 1 ? v.toFixed(2) : Math.round(v)}${axis.unit}`

// Per-axis snap targets (value → 5px snap zone on the pad): Tracking snaps to 0, GEOM
// to 25 (the UI default). `rawFrac` is the pointer's position fraction (0 = left/top),
// `padPx` the pad width(X)/height(Y), `isY` flips because the Y value grows upward.
// Axes symmetric around 0 (Tracking) also get an eased (semi-log) curve so they're
// gentle near center — easier to drag the OTHER axis without nudging this one.
const DEADZONE = 5
const SNAPS = { spacing: [0], geom: [25] }
const adjustFrac = (rawFrac, axis, padPx, isY) => {
    const snaps = SNAPS[axis.key]
    if (snaps) {
        for (const sv of snaps) {
            const svf = (sv - axis.min) / (axis.max - axis.min)
            const target = isY ? 1 - svf : svf
            if (Math.abs(rawFrac - target) * padPx < DEADZONE) return target
        }
    }
    if (axis.min < 0 && axis.max > 0) {
        const d = rawFrac - 0.5
        return clamp01(0.5 + (Math.sign(d) * Math.pow(Math.abs(d) * 2, 2.2)) / 2)
    }
    return rawFrac
}

// iOS Safari scrolls the page to reveal the caret when an editable takes focus, and again
// as the keyboard opens. Holds the page where it was at the tap, unless the tapped line
// would end up under the keyboard, where iOS's own scroll is the one we want. The tap point
// stands in for the caret. The keyboard takes about 45% of the screen before it's measurable.
function useIOSFocusScrollGuard(ref: { current: HTMLElement | null }) {
    useEffect(() => {
        const el = ref.current
        const isIOS =
            /iP(hone|ad|od)/.test(navigator.userAgent) ||
            (/Mac/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
        if (!el || !isIOS) return
        let savedY: number | null = null
        let tapY = 0
        let frame = 0
        const onTouchStart = (e: TouchEvent) => {
            cancelAnimationFrame(frame)
            savedY = window.scrollY
            tapY = e.touches[0].clientY
        }
        const onTouchMove = () => {
            cancelAnimationFrame(frame)
            savedY = null
        }
        const onFocus = () => {
            if (savedY === null) return
            const y = savedY
            const until = performance.now() + 700
            const hold = () => {
                const vv = window.visualViewport
                const keyboardOpen = !!vv && vv.height < window.innerHeight * 0.8
                const room = vv ? (keyboardOpen ? vv.height : vv.height * 0.55) : 0
                if (tapY + 48 < room && window.scrollY !== y) {
                    window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior })
                }
                if (performance.now() < until) frame = requestAnimationFrame(hold)
            }
            frame = requestAnimationFrame(hold)
        }
        el.addEventListener("touchstart", onTouchStart, { passive: true })
        window.addEventListener("touchmove", onTouchMove, { passive: true })
        el.addEventListener("focus", onFocus)
        return () => {
            cancelAnimationFrame(frame)
            el.removeEventListener("touchstart", onTouchStart)
            window.removeEventListener("touchmove", onTouchMove)
            el.removeEventListener("focus", onFocus)
        }
    }, [ref])
}

export default function KaossTester(props) {
    const {
        text,
        debug,
        refreshColor,
        refreshSize,
        defaultWeight,
        defaultSize,
        defaultSpacing,
        previewHeight,
    } = props
    const ver = calFont(props)
    // starting state, seeded from the exposed default props (the rest from DEFAULTS)
    const baseVals = {
        ...DEFAULTS,
        wght: defaultWeight,
        size: defaultSize,
        spacing: defaultSpacing,
    }
    const [vals, setVals] = useState(baseVals)
    const [open, setOpen] = useState<number | null>(null)
    const [specimen, setSpecimen] = useState(text)
    const [probe, setProbe] = useState("…")
    const [faceLoaded, setFaceLoaded] = useState(false)
    const controls = useAnimation()
    const taRef = useRef<HTMLTextAreaElement>(null)
    useIOSFocusScrollGuard(taRef)
    // measure the actual rendered height so the layout is frame-relative without relying
    // on cqh/dvh (cqh reads 0 in an auto-height frame; dvh used the browser viewport)
    const rootRef = useRef<HTMLDivElement>(null)
    const [rootH, setRootH] = useState(844)
    useEffect(() => {
        const el = rootRef.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => setRootH(e.contentRect.height))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // Inject the active build's @font-face; probe the binary when debug is on.
    useEffect(() => {
        const s = document.createElement("style")
        s.innerHTML = buildFontFaceCSS(ver)
        document.head.appendChild(s)
        let alive = true
        if (debug) {
            setProbe("probing…")
            readFontRevision(ver.url).then((r) => alive && setProbe(r))
            const face = `700 24px "${ver.family}"`
            const check = () =>
                alive && setFaceLoaded(document.fonts.check(face))
            check()
            document.fonts.ready.then(check)
        }
        return () => {
            alive = false
            document.head.removeChild(s)
        }
    }, [ver.family, debug])

    // Size the field to its content so the scroller can move whole lines past the centre
    // line. Also lock scrolling until the text is tall enough to flow under the board —
    // otherwise the big top/bottom spacers let you drag a single line into empty space.
    // Re-measure on font load (else scrollHeight reads pre-Cal-Sans).
    const [canScroll, setCanScroll] = useState(false)
    const measuredOnce = useRef(false)
    useEffect(() => {
        const ta = taRef.current
        if (!ta) return
        const grow = () => {
            // Resetting the height can collapse the page for a moment; don't let that move it.
            const y = window.scrollY
            ta.style.height = "auto"
            const h = ta.scrollHeight
            ta.style.height = `${h}px`
            if (window.scrollY !== y) window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior })
            // read-line sits `previewHeight` above the board; the top half of line 1 is
            // above it, so the text only reaches the board past previewHeight + ½ line
            setCanScroll(h > previewHeight + 0.6 * vals.size)
        }
        // The first run waits for fonts and one shared frame, so hydration never
        // forces layout; later runs (typing, a slider) measure at once.
        let raf = 0
        const later = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(grow)
        }
        if (!measuredOnce.current) {
            measuredOnce.current = true
            if (document.fonts?.ready) document.fonts.ready.then(later)
            else later()
        } else {
            grow()
            document.fonts?.ready.then(later)
        }
        return () => cancelAnimationFrame(raf)
    }, [specimen, vals.size, vals.wght, vals.spacing, ver.family, previewHeight])

    const dirty = JSON.stringify(vals) !== JSON.stringify(baseVals)
    const handleReset = async () => {
        await controls.start({ rotate: 360, transition: { duration: 0.5 } })
        controls.set({ rotate: 0 })
        setVals(baseVals)
        setOpen(null)
    }

    const setFromPad = (quad, fx, fy) =>
        setVals((v) => ({
            ...v,
            [quad.x.key]: quad.x.min + fx * (quad.x.max - quad.x.min),
            [quad.y.key]: quad.y.min + (1 - fy) * (quad.y.max - quad.y.min),
        }))

    const fvs = `"wght" ${vals.wght}, "opsz" ${vals.opsz}, "GEOM" ${vals.geom}, "YTAS" ${ytasCss(vals.ytas)}, "SHRP" ${vals.shrp}, "ital" ${vals.ital}`

    return (
        <div
            ref={rootRef}
            onClick={() => open !== null && setOpen(null)}
            style={{
                // Fill the CONTAINER (the Card/section this sits in). Size the tester by
                // sizing its Framer frame — NOT via props. min floors stop it collapsing if
                // the frame is auto-sized. Inner layout reads the MEASURED rootH.
                width: "100%",
                minWidth: 320,
                height: "100%",
                // floor (used only if the Card is auto-height): tall enough that the
                // specimen's top padding stays positive — below ~500 it goes negative and
                // clips. The real height should come from a definite-height Card.
                minHeight: 640,
                fontFamily: `"${ver.family}", sans-serif`,
                background: "#ffffff",
                position: "relative",
                overflow: "hidden",
                // debug: magenta outline shows the component's actual bounds
                outline: debug ? "2px solid #ff00ff" : undefined,
                outlineOffset: -2,
            }}
        >
            {/* dirty-state reset (ported from CustomTypeTester) */}
            <motion.div
                onClick={handleReset}
                animate={controls}
                style={{
                    position: "absolute",
                    bottom: rootH * 0.33 + 40,
                    right: 40,
                    width: refreshSize,
                    height: refreshSize,
                    cursor: "pointer",
                    zIndex: 50,
                    opacity: dirty ? 0.55 : 0,
                    pointerEvents: dirty ? "auto" : "none",
                    transition: "opacity 0.3s ease",
                }}
            >
                <svg
                    width={refreshSize}
                    height={refreshSize}
                    viewBox="0 0 16 16"
                    fill="none"
                >
                    <path
                        fill={refreshColor}
                        fillRule="evenodd"
                        d="M13.5 8c0-3.034-2.474-5.5-5.535-5.5a5.53 5.53 0 0 0-5.328 4H6V8H.75A.75.75 0 0 1 0 7.25V2h1.5v3.233A7.04 7.04 0 0 1 7.965 1C11.846 1 15 4.13 15 8s-3.154 7-7.035 7a7.04 7.04 0 0 1-5.695-2.888l-.442-.605 1.211-.885.443.605A5.54 5.54 0 0 0 7.965 13.5c3.06 0 5.535-2.466 5.535-5.5"
                        clipRule="evenodd"
                    />
                </svg>
            </motion.div>

            {/* live specimen — a scroller filling the full height behind the board. The
                first line sits centered `Sample Height` above the board; type more and
                lines flow DOWN under the Kaossilator (fading into it). Scroll to bring any
                buried line back up to that centre. (Board ≈ 33% of height + 38px chrome.) */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    // locked until the text would flow under the board
                    overflow: canScroll ? "auto" : "hidden",
                    padding: "0 16px",
                    outline: debug ? "1px dashed #00ccff" : undefined,
                }}
            >
                <div
                    style={{
                        // top spacer lands the FIRST line's centre `Sample Height` above
                        // the board; bottom spacer is room to scroll the LAST line up to it
                        fontSize: vals.size,
                        lineHeight: 1.2,
                        paddingTop:
                            rootH * 0.67 - 38 - previewHeight - 0.6 * vals.size,
                        paddingBottom: rootH * 0.33 + 38 + previewHeight,
                    }}
                >
                    <textarea
                        ref={taRef}
                        value={specimen}
                        onChange={(e) => setSpecimen(e.target.value)}
                        spellCheck={false}
                        readOnly={open !== null}
                        style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            padding: 0,
                            margin: 0,
                            resize: "none",
                            overflow: "hidden",
                            display: "block",
                            textAlign: "center",
                            direction: "ltr",
                            fontFamily: "inherit",
                            fontSize: vals.size,
                            fontWeight: vals.wght,
                            letterSpacing: `${vals.spacing / 100}em`,
                            fontOpticalSizing: "none", // explicit opsz below; WebKit drops opsz = default and auto-sizes over it
                            fontStyle: vals.ital >= 0.5 ? "italic" : "normal", // the cossui build italicises by file, not by the ital axis
                            fontVariationSettings: fvs,
                            color: "#242424",
                            lineHeight: 1.2,
                            // when the modal is open, taps pass through to close it
                            pointerEvents: open !== null ? "none" : "auto",
                        }}
                    />
                </div>
            </div>

            {/* top fade — scrolled-up text dissolves into white before the header instead
                of overlapping it (the Cal.com header sits above this component) */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 96,
                    background:
                        "linear-gradient(to top, rgba(255,255,255,0), #ffffff)",
                    pointerEvents: "none",
                    zIndex: 2,
                }}
            />

            {/* fade — the type dissolves into white just before it reaches the board */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: rootH * 0.33 + 38,
                    height: 64,
                    background:
                        "linear-gradient(to bottom, rgba(255,255,255,0), #ffffff)",
                    pointerEvents: "none",
                    zIndex: 2,
                }}
            />

            {/* board region — OVERLAYS the bottom (absolute) with an opaque fill, so the
                specimen text flows underneath it. Full width on phones, capped + centered
                on wider frames so the quads don't stretch into thin wide rectangles. */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    padding: "0 8px 10px",
                    background: "#ffffff",
                    zIndex: 3,
                    outline: debug ? "1px dashed #00ff66" : undefined,
                }}
            >
              <div style={{ width: "100%", maxWidth: 560 }}>
                {/* second affordance — state-aware; "Back" is tappable to dismiss */}
                <div
                    onClick={() => open !== null && setOpen(null)}
                    style={{
                        fontSize: 16,
                        color: "#acacac",
                        // indent to line up with the X-axis labels (Optical), not the
                        // far-left Y-label column
                        marginLeft: `${M}%`,
                        padding: "4px 0 8px",
                        cursor: open !== null ? "pointer" : "default",
                        userSelect: "none",
                    }}
                >
                    {open === null ? "Tap or drag any" : "← Back"}
                </div>
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        height: rootH * 0.33,
                    }}
                >
                    {/* resting quads — the OTHERS stay visible (dimmed) as an affordance
                        that we're on top of the tapped one; the tapped quad is replaced
                        by the expanded pad, which morphs out of that quad's position. */}
                    {QUADS.map((q, i) =>
                        i === open ? null : (
                            <Pad
                                key={i}
                                quad={q}
                                rect={QUAD_POS[i]}
                                vals={vals}
                                onOpen={() => setOpen(i)}
                                setFromPad={setFromPad}
                                dim={open !== null}
                            />
                        )
                    )}
                    {open !== null && (
                        <Pad
                            key="expanded"
                            quad={QUADS[open]}
                            rect={INNER}
                            fromRect={QUAD_POS[open]}
                            vals={vals}
                            expanded
                            setFromPad={setFromPad}
                        />
                    )}
                </div>
              </div>
            </div>

            {/* DEBUG BADGE — portaled to <body>, i.e. OUTSIDE this component's sizing
                boxes entirely, so it shows even if the component collapses/clips. If this
                does NOT appear, the component itself isn't rendering (Framer visibility). */}
            {debug &&
                typeof document !== "undefined" &&
                createPortal(
                    <div style={versionBadgeStyle}>
                    <div style={{ fontWeight: 700 }}>Version report</div>
                    <div>
                        binary: {probe}
                    </div>
                    <div>face loaded: {faceLoaded ? "✓" : "✗"}</div>
                    <div style={{ marginTop: 6, color: "#7ad0ff" }}>
                        rootH {Math.round(rootH)} · board{" "}
                        {Math.round(rootH * 0.33)}
                    </div>
                    <div style={{ color: "#ff9", opacity: 0.8 }}>
                        scroll {canScroll ? "on" : "locked"} · open{" "}
                        {open === null ? "—" : open}
                    </div>
                    </div>,
                    document.body
                )}
        </div>
    )
}

const MORPH = { duration: 0.2, ease: "easeInOut" }
const DRAG_THRESH = 6 // px of movement before a press on a collapsed quad becomes a drag

// One pad (resting quadrant OR the expanded inner pad). On expand, every element
// animates its CSS position from the tapped quad's rect (`fromRect`) → the inner rect
// over 0.2s. Static transforms (rotate / translate) stay in `style` so the position
// animation doesn't fight them. Labels whose from/to positions coincide (Optical's X
// name, Ascend's Y name) simply don't move; the rest ease at the same rate.
function Pad({ quad, rect, vals, expanded, onOpen, setFromPad, fromRect, dim }) {
    const ref = useRef<HTMLDivElement>(null)
    const dragging = useRef(false)
    const startPt = useRef<{ x: number; y: number } | null>(null) // collapsed press point
    const movedRef = useRef(false) // collapsed press became a drag (suppresses the tap)
    const [grown, setGrown] = useState(false) // collapsed: dot grown into drag mode
    const fx = fracOf(vals, quad.x)
    const fy = 1 - fracOf(vals, quad.y)
    const op = dim ? 0.28 : 1

    // After the expand morph finishes, drag the dot instantly (no 0.2s lag).
    const [morphed, setMorphed] = useState(!expanded)
    useEffect(() => {
        if (!expanded) return
        const t = setTimeout(() => setMorphed(true), 220)
        return () => clearTimeout(t)
    }, [expanded])

    const handle = (cx, cy) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        // un-inset: usable area is [ins, 1-ins] of the pad
        const ins = expanded ? PAD_INSET : RESTING_INSET
        const span = 1 - 2 * ins
        const rawX = clamp01(((cx - r.left) / r.width - ins) / span)
        const rawY = clamp01(((cy - r.top) / r.height - ins) / span)
        const ax = adjustFrac(rawX, quad.x, r.width, false)
        const ay = adjustFrac(rawY, quad.y, r.height, true)
        setFromPad(quad, ax, ay)
    }

    const squarePos = (r) => ({
        left: `${r.left}%`,
        top: `${r.top}%`,
        width: `${r.size}%`,
        height: `${r.size}%`,
    })
    const dotPos = (r, sizeBig, inset) => ({
        left: `${alongAxis(r.left, r.size, fx, inset)}%`,
        top: `${alongAxis(r.top, r.size, fy, inset)}%`,
        width: sizeBig ? 34 : 13,
        height: sizeBig ? 34 : 13,
    })
    const xNamePos = (r) => ({ left: `${r.left}%`, bottom: `${100 - r.top}%` })
    const yNamePos = (r) => ({
        right: `${100 - r.left}%`,
        bottom: `${100 - r.top - r.size}%`,
    })

    return (
        <>
            {/* pad surface */}
            <motion.div
                ref={ref}
                onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId)
                    if (expanded) {
                        dragging.current = true
                        handle(e.clientX, e.clientY)
                    } else {
                        // collapsed: defer — tap (expand) vs drag (adjust) decided on move
                        startPt.current = { x: e.clientX, y: e.clientY }
                        movedRef.current = false
                    }
                }}
                onPointerMove={(e) => {
                    if (expanded) {
                        if (dragging.current) handle(e.clientX, e.clientY)
                    } else if (startPt.current) {
                        if (
                            !movedRef.current &&
                            Math.hypot(
                                e.clientX - startPt.current.x,
                                e.clientY - startPt.current.y
                            ) > DRAG_THRESH
                        ) {
                            movedRef.current = true
                            setGrown(true) // dot grows → "you're driving now"
                        }
                        if (movedRef.current) handle(e.clientX, e.clientY)
                    }
                }}
                onPointerUp={() => {
                    if (expanded) dragging.current = false
                    else {
                        startPt.current = null
                        setGrown(false)
                    }
                }}
                onClick={(e) => {
                    // expanded: swallow so the root doesn't close. collapsed: a clean tap
                    // (no drag) opens; a finished drag swallows the click so it doesn't.
                    if (expanded || movedRef.current) {
                        e.stopPropagation()
                        return
                    }
                    onOpen()
                }}
                initial={expanded ? squarePos(fromRect) : false}
                animate={{ ...squarePos(rect), opacity: op }}
                transition={MORPH}
                style={{
                    position: "absolute",
                    background: "#e9e9e9",
                    borderRadius: expanded ? 18 : 12,
                    cursor: "pointer",
                    touchAction: "none",
                }}
            />

            {/* X axis name — left-aligned above the pad (Optical doesn't move) */}
            <motion.span
                initial={expanded ? xNamePos(fromRect) : false}
                animate={{ ...xNamePos(rect), opacity: op }}
                transition={MORPH}
                style={{
                    position: "absolute",
                    paddingBottom: 3,
                    fontSize: 16,
                    color: "#8e8e8e",
                    whiteSpace: "nowrap",
                }}
            >
                {quad.x.label}
            </motion.span>

            {/* Y axis name — bottom-aligned on the left edge (Ascend doesn't move) */}
            <motion.span
                initial={expanded ? yNamePos(fromRect) : false}
                animate={{ ...yNamePos(rect), opacity: op }}
                transition={MORPH}
                style={{
                    position: "absolute",
                    paddingRight: 3,
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    fontSize: 16,
                    color: "#8e8e8e",
                    whiteSpace: "nowrap",
                }}
            >
                {quad.y.label}
            </motion.span>

            {/* expanded-only overlays — current values, coordinate stops (fade in) */}
            {expanded && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={MORPH}
                    style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                >
                    {/* X current value — centered above the pad (tabular) */}
                    <span
                        style={{
                            position: "absolute",
                            left: `${rect.left + rect.size / 2}%`,
                            bottom: `${100 - rect.top}%`,
                            transform: "translateX(-50%)",
                            paddingBottom: 3,
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#242424",
                            fontVariantNumeric: "tabular-nums",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {fmtVal(vals[quad.x.key], quad.x)}
                    </span>

                    {/* Y current value — centered on the left edge, reading up (tabular) */}
                    <div
                        style={{
                            position: "absolute",
                            right: `${100 - rect.left}%`,
                            top: `${rect.top}%`,
                            height: `${rect.size}%`,
                            paddingRight: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <span
                            style={{
                                writingMode: "vertical-rl",
                                transform: "rotate(180deg)",
                                fontSize: 16,
                                fontWeight: 600,
                                color: "#242424",
                                fontVariantNumeric: "tabular-nums",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {fmtVal(vals[quad.y.key], quad.y)}
                        </span>
                    </div>

                    {/* coordinate stops */}
                    {quad.x.stops.map((s, i) => (
                        <span
                            key={`x${i}`}
                            style={{
                                position: "absolute",
                                left: `${alongAxis(rect.left, rect.size, stopPos(s, quad.x), PAD_INSET)}%`,
                                top: `${rect.top}%`,
                                transform: "translate(-50%, 6px)",
                                fontSize: 13,
                                color: "#8e8e8e",
                            }}
                        >
                            {s}
                            {quad.x.unit}
                        </span>
                    ))}
                    {quad.y.stops.map((s, i) => (
                        <span
                            key={`y${i}`}
                            style={{
                                position: "absolute",
                                left: `${rect.left}%`,
                                top: `${alongAxis(rect.top, rect.size, 1 - stopPos(s, quad.y), PAD_INSET)}%`,
                                transform: "translate(7px, -50%)",
                                fontSize: 13,
                                color: "#8e8e8e",
                            }}
                        >
                            {s}
                        </span>
                    ))}
                </motion.div>
            )}

            {/* dot — grows + moves on expand; tracks instantly once morphed */}
            <motion.div
                initial={expanded ? dotPos(fromRect, false, RESTING_INSET) : false}
                animate={{
                    ...(expanded
                        ? dotPos(rect, true, PAD_INSET)
                        : dotPos(rect, grown, RESTING_INSET)),
                    opacity: op,
                }}
                transition={
                    expanded
                        ? {
                              default: MORPH,
                              left: morphed ? { duration: 0 } : MORPH,
                              top: morphed ? { duration: 0 } : MORPH,
                          }
                        : {
                              default: MORPH,
                              left: grown ? { duration: 0 } : MORPH,
                              top: grown ? { duration: 0 } : MORPH,
                          }
                }
                style={{
                    position: "absolute",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background: "#242424",
                    pointerEvents: "none",
                    // lifted like the expanded ("max") dot while dragging a 2×2 quad;
                    // drops back when the drag ends (grown → false, size animates 34→13)
                    boxShadow:
                        expanded || grown
                            ? "0 4px 14px rgba(0,0,0,0.3)"
                            : "none",
                }}
            />
        </>
    )
}

const versionBadgeStyle: React.CSSProperties = {
    // FIXED to the viewport, not the component — so it stays visible even when the
    // component's own box collapses to 0 (the whole point: diagnose the collapse).
    position: "fixed",
    top: 8,
    left: 8,
    zIndex: 999999,
    background: "rgba(20,20,20,0.9)",
    color: "#E6FF7A",
    font: "11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",
    padding: "8px 10px",
    borderRadius: 8,
    pointerEvents: "none",
    whiteSpace: "pre",
}

KaossTester.defaultProps = {
    text: SAMPLE_TEXT,
    debug: false,
    refreshColor: "#666666",
    refreshSize: 28,
    defaultWeight: 400,
    defaultSize: 96,
    defaultSpacing: 0,
    previewHeight: 240,
}

addPropertyControls(KaossTester, {
    ...FONT_CONTROLS,
    text: { type: ControlType.String, title: "Text", defaultValue: SAMPLE_TEXT },
    defaultWeight: {
        type: ControlType.Number,
        title: "Weight",
        min: 400,
        max: 700,
        defaultValue: 400,
    },
    defaultSize: {
        type: ControlType.Number,
        title: "Size",
        min: 8,
        max: 350,
        unit: "px",
        defaultValue: 96,
    },
    defaultSpacing: {
        type: ControlType.Number,
        title: "Tracking",
        min: -10,
        max: 10,
        step: 0.5,
        unit: "%",
        defaultValue: 0,
    },
    previewHeight: {
        type: ControlType.Number,
        title: "Sample Height",
        min: 40,
        max: 600,
        unit: "px",
        defaultValue: 240,
    },
    refreshColor: {
        type: ControlType.Color,
        title: "Reset Color",
        defaultValue: "#666666",
    },
    refreshSize: {
        type: ControlType.Number,
        title: "Reset Size",
        min: 12,
        max: 64,
        defaultValue: 28,
    },
    debug: { type: ControlType.Boolean, title: "Debug Badge", defaultValue: false },
})
