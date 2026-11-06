import { addPropertyControls, ControlType } from "framer"
import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useMotionValue, useTransform, useAnimationFrame } from "framer-motion"
import { buildFontFaceCSS } from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"

// ─────────────────────────────────────────────────────────────────────────────
// HOIGrid.tsx — Cal Sans Flex "HOI / avar2" teaser.
//
// A grid of the glyphs whose GEOM axis actually does higher-order interpolation.
// Every cell is its OWN oscillator: you give it a glyph + the GEOM band(s) where its
// HOI fires, and it ping-pongs through them forever — always moving, never held. Cells
// are independent, so the I can swing 5→10 while a t swings 34→40 and 75→80. All cells
// read one global performance.now() clock (same pattern as CalAxes), so it's fully
// deterministic and any number of instances stay coherent.
//
// Motion per cell: for bands [[lo,hi], …] it eases lo→hi→lo within each band, then SNAPS
// to the next band's lo (the only jumps — across the dead zones where nothing changes).
// Both edges of every band are swept, so goopy-but-real midpoints (e.g. ~78) DO render.
//
// Each cell can also carry a radar "ping" — the concentric-ring ripple — pinned to an
// anchor (px, py as % of the cell) so it marks exactly where that glyph's terminal moves.
//
// Live font (browser applies avar2). @font-face comes from Shared.tsx's buildFontFaceCSS
// (Flex build passed through as a local version object — Shared is untouched).
// ─────────────────────────────────────────────────────────────────────────────

// Flex build, shaped like Shared's CAL_SANS so buildFontFaceCSS eats it as-is.
const FLEX = {
    family: "CalSansFlex_v2",
    url:
        "https://cdn.jsdelivr.net/gh/calcom/sans@main/fonts/calsans-var-flex/CalSansFlexVF.ttf?v=flex09237",
}

const LEG = 900 // ms per sweep leg (lo→hi or hi→lo) at speed = 1

// Radar-ping ripple (from the CodePen ref): scale 0.2→1, fade in then out.
const PING_KEYFRAMES = `@keyframes hoiPing {
  0%   { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
  50%  { opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}`

const easeInOut = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// "34-40, 75-80" → [[34,40],[75,80]]. Tolerant of spaces; drops malformed/zero-width.
function parseBands(s: string): [number, number][] {
    return String(s)
        .split(",")
        .map((seg) => seg.trim().split("-").map(Number))
        .filter((r) => r.length === 2 && isFinite(r[0]) && isFinite(r[1]) && r[0] !== r[1])
        .map((r) => [r[0], r[1]] as [number, number])
}

// "50,15; 50,85" → [{x:50,y:15},{x:50,y:85}]. Semicolon-separated x,y anchors (% of cell).
function parsePings(s: string): { x: number; y: number }[] {
    return String(s)
        .split(";")
        .map((seg) => seg.trim().split(",").map(Number))
        .filter((r) => r.length === 2 && isFinite(r[0]) && isFinite(r[1]))
        .map((r) => ({ x: r[0], y: r[1] }))
}

function HOICell(props: any) {
    const {
        glyph,
        bands,
        fontSize,
        opticalSize,
        weight,
        glyphColor,
        spd,
        debug,
        paused,
        pings,
        pingColor,
        pingSize,
    } = props

    // Each band plays FORWARD on the way out, then every band plays BACKWARD on the
    // way home, in reverse order:  12→15, 36→40, 76→80,  80→76, 40→36, 15→12.
    // The cuts therefore land only in the DEAD ZONES between bands, where the font
    // interpolates nothing and the form is identical either side, so they are
    // invisible. Playing each band out-and-back instead (12→15→12, then cut to 36)
    // rewinds the morph and then cuts to a form that has already advanced — that is
    // the visible snap. It also means the loop closes on itself: the last leg ends
    // where the first begins, so there is no jump at the wrap.
    const legs = useMemo<[number, number][]>(() => {
        const B = parseBands(bands)
        if (!B.length) return [[25, 25]]
        const L: [number, number][] = []
        B.forEach(([lo, hi]) => L.push([lo, hi]))
        for (let i = B.length - 1; i >= 0; i--) L.push([B[i][1], B[i][0]])
        return L
    }, [bands])

    const anchors = useMemo(() => parsePings(pings), [pings])

    const geom = useMotionValue(legs[0][0])
    const legDur = LEG / (spd <= 0 ? 1 : spd)
    const cycle = legs.length * legDur

    // Phase is measured from THIS CELL's start, not the wall clock. With
    // performance.now() the position was (time-since-page-load) mod (this cell's
    // cycle), and cycle length varies with band count — so a cell dropped in at
    // whatever stage absolute time dictated instead of starting at leg 0, and the
    // cells with the most legs (t, y, 9) were the most likely to be caught
    // mid-journey.
    const t0 = useRef(performance.now())
    // Live GEOM readout, written straight to the DOM from the animation frame so it
    // costs no React re-render.
    const readoutRef = useRef<HTMLDivElement | null>(null)

    // Pause holds the current frame and, on resume, shifts t0 by however long we
    // were stopped — so it carries on from where it froze instead of jumping to
    // wherever the clock got to.
    const pausedAt = useRef<number | null>(null)

    // Off screen nothing is written: the callback returns at the top (a ref, so the
    // hook never re-subscribes). The cell clock keeps running, so the first frame
    // back is the current one.
    const cellRef = useRef<HTMLDivElement | null>(null)
    const onScreenRef = useRef(true)
    useEffect(() => {
        const el = cellRef.current
        if (!el || typeof IntersectionObserver === "undefined") return
        const io = new IntersectionObserver(([e]) => {
            onScreenRef.current = e.isIntersecting
        })
        io.observe(el)
        return () => io.disconnect()
    }, [])

    useAnimationFrame(() => {
        if (!onScreenRef.current) return
        // While paused, freeze the CLOCK rather than skipping the body — the frame
        // still recomputes and writes the readout, so a paused start shows its values
        // instead of a blank label. On resume, t0 shifts by the time spent stopped so
        // it continues from the frozen frame.
        if (paused && pausedAt.current === null) pausedAt.current = performance.now()
        if (!paused && pausedAt.current !== null) {
            t0.current += performance.now() - pausedAt.current
            pausedAt.current = null
        }
        const now = pausedAt.current ?? performance.now()
        const t = (now - t0.current) % cycle
        const i = Math.min(legs.length - 1, Math.floor(t / legDur))
        const f = easeInOut((t - i * legDur) / legDur)
        const [a, b] = legs[i]
        const v = a + f * (b - a)
        geom.set(v) // snap between bands happens at leg boundaries
        if (readoutRef.current)
            readoutRef.current.textContent =
                v.toFixed(1) + "  leg " + (i + 1) + "/" + legs.length
    })

    const fvs = useTransform(
        geom,
        (v) =>
            `"opsz" ${opticalSize}, "GEOM" ${v}, "wght" ${weight}, "YTAS" 720, "SHRP" 0, "ital" 0`
    )

    const pingDur = 2 / (spd <= 0 ? 1 : spd)
    const rings = [0, 0.5, 1] // stagger (× pingDur) so a new ripple leaves as the last fades
    // pingSize is an em ratio (~0.9). Tolerate legacy px values (>5) saved before the
    // px→em switch by converting them, so old instances don't render giant rings.
    const pingEm = pingSize > 5 ? pingSize / fontSize : pingSize

    return (
        <div
            ref={cellRef}
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "visible", // reveal: never clip glyph overhang or ping rings
            }}
        >
            {debug && (
                <div
                    ref={readoutRef}
                    style={{
                        position: "absolute",
                        left: "50%",
                        bottom: 4,
                        transform: "translateX(-50%)",
                        font: "600 10px ui-monospace, SFMono-Regular, Menlo, monospace",
                        color: glyphColor,
                        opacity: 0.6,
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                        zIndex: 3,
                    }}
                />
            )}
            <motion.span
                style={{
                    position: "relative", // pings anchor to THIS box (the glyph), not the cell
                    display: "inline-block",
                    fontFamily: `"${FLEX.family}", sans-serif`,
                    fontSize,
                    lineHeight: 1,
                    color: glyphColor,
                    fontOpticalSizing: "none", // opsz is fixed, not size-driven
                    fontVariationSettings: fvs,
                    whiteSpace: "pre",
                    userSelect: "none",
                }}
            >
                {glyph}
                {anchors.map((p, ai) =>
                    rings.map((delay, ri) => (
                        <span
                            key={`${ai}-${ri}`}
                            style={{
                                // % is of the glyph box; em size + border track fontSize →
                                // one anchor value stays correct across every breakpoint.
                                position: "absolute",
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                                width: `${pingSize}em`,
                                height: `${pingSize}em`,
                                border: `0.012em solid ${pingColor}`,
                                borderRadius: "50%",
                                opacity: 0,
                                pointerEvents: "none",
                                transform: "translate(-50%, -50%)",
                                animation: `hoiPing ${pingDur}s linear ${delay * pingDur}s infinite`,
                            }}
                        />
                    ))
                )}
            </motion.span>
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function HOIGrid(props: any) {
    const {
        columns,
        cells,
        fontSize,
        opticalSize,
        weight,
        bgColor,
        glyphColor,
        gap,
        speed,
        pingColor,
        pingSize,
        style,
    } = props

    const list = (cells || []).filter((c: any) => c && String(c.glyph).length)

    // Click ANYWHERE on the grid to freeze/resume. null means "follow the prop";
    // once clicked, the click WINS — OR-ing the two meant a component set paused in
    // the panel could never be resumed by clicking, since true || anything is true.
    const [clickOverride, setClickOverride] = useState<boolean | null>(null)
    const isPaused = clickOverride === null ? (props.paused ?? false) : clickOverride

    return (
        <div
            onClick={() => setClickOverride(!isPaused)}
            style={{
                cursor: "pointer",
                ...style,
                width: "100%",
                height: "100%",
                display: "grid",
                gridTemplateColumns: `repeat(${Math.max(1, columns)}, 1fr)`,
                gridAutoRows: "1fr",
                gap,
                background: bgColor,
                boxSizing: "border-box",
            }}
        >
            <style>{buildFontFaceCSS(FLEX, "block") + "\n" + PING_KEYFRAMES}</style>
            {list.map((c: any, i: number) => (
                <HOICell
                    key={i}
                    glyph={c.glyph}
                    bands={c.bands}
                    pings={c.pings || ""}
                    fontSize={fontSize}
                    opticalSize={opticalSize}
                    weight={weight}
                    glyphColor={glyphColor}
                    spd={speed}
                    debug={props.debug ?? false}
                    paused={isPaused}
                    pingColor={pingColor}
                    pingSize={pingSize}
                />
            ))}
        </div>
    )
}

// Bands measured from the Flex VF outline at every GEOM step, not authored by
// eye: these are the only ranges where each glyph actually moves. A band over a
// flat stretch of the axis animates the number while the outline sits still,
// which reads as a pause and then as a jump when the next leg cuts away.
const DEFAULT_CELLS = [
    { glyph: "I", bands: "5-10", pings: "50,15; 50,85" },
    { glyph: "t", bands: "35-40, 75-80", pings: "50,78" },
    { glyph: "f", bands: "35-40, 75-80", pings: "50,30" },
    { glyph: "y", bands: "35-40, 75-80", pings: "55,80" },
    { glyph: "j", bands: "35-40, 75-80", pings: "50,82" },
    { glyph: "M", bands: "75-80", pings: "30,35; 70,35" },
    { glyph: "C", bands: "76-80", pings: "72,28; 72,78" },
    { glyph: "9", bands: "80-75, 40-35", pings: "60,40" },
]

HOIGrid.defaultProps = {
    columns: 4,
    cells: DEFAULT_CELLS,
    fontSize: 140,
    opticalSize: 10,
    weight: 400,
    bgColor: "transparent", // CalAxes has no field — sits on the page
    glyphColor: "#111111", // CalAxes glyph color
    gap: 0,
    speed: 1,
    debug: false,
    paused: false,
    pingColor: "#ff6b35", // house accent orange
    pingSize: 0.9, // em — ring diameter as a fraction of font size (scales per breakpoint)
}

addPropertyControls(HOIGrid, {
    columns: { type: ControlType.Number, title: "Columns", defaultValue: 4, min: 1, max: 12, step: 1, displayStepper: true },
    cells: {
        type: ControlType.Array,
        title: "Cells",
        control: {
            type: ControlType.Object,
            controls: {
                glyph: { type: ControlType.String, title: "Glyph", defaultValue: "t" },
                bands: {
                    type: ControlType.String,
                    title: "Bands",
                    defaultValue: "75-80",
                    description: "GEOM ranges, e.g. 5-10  or  34-40, 75-80",
                },
                pings: {
                    type: ControlType.String,
                    title: "Pings",
                    defaultValue: "50,50",
                    description: "x,y anchors in %, e.g. 50,78  or  30,35; 70,35",
                },
            },
        },
        defaultValue: DEFAULT_CELLS,
    },
    fontSize: { type: ControlType.Number, title: "Size", defaultValue: 140, min: 8, max: 600, step: 1, unit: "px" },
    opticalSize: { type: ControlType.Number, title: "opsz", defaultValue: 10, min: 8, max: 45, step: 1 },
    weight: { type: ControlType.Number, title: "Weight", defaultValue: 400, min: 400, max: 700, step: 1 },
    gap: { type: ControlType.Number, title: "Gap", defaultValue: 0, min: 0, max: 120, step: 1, unit: "px" },
    paused: {
        type: ControlType.Boolean,
        title: "Pause",
        defaultValue: false,
        enabledTitle: "Paused",
        disabledTitle: "Running",
    },
    debug: {
        type: ControlType.Boolean,
        title: "GEOM readout",
        defaultValue: false,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    speed: { type: ControlType.Number, title: "Speed", defaultValue: 1, min: 0.25, max: 4, step: 0.25 },
    pingSize: { type: ControlType.Number, title: "Ping size", defaultValue: 0.9, min: 0.1, max: 3, step: 0.05, unit: "em" },
})
