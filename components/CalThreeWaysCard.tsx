import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useMotionValue, motionValue, useAnimationFrame } from "framer-motion"
// Font-version machinery lives in Shared.tsx (Phase 2). Re-Copy-Import after any
// Shared edit — the @<hash> in the URL is a version pin.
import {
    CAL_SANS,
    buildFontFaceCSS,
    readFontRevision,
} from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"

// ─────────────────────────────────────────────────────────────────────────────
// CalThreeWaysCard.tsx — the animated part INSIDE the "3 ways to adjust Cal Sans"
// specimen cards. The card chrome (number badge, tag, bottom label) is native
// Framer — this renders the specimen word PLUS a miniature control being operated
// by an animated cursor, so the card shows the INTERACTION, not just the result:
//
//   geom      — a cursor drags a mini GEOM slider back and forth; the track
//               carries the four landing bands from the GEOM diagnostic sheet
//   features  — a cursor clicks ssXX/cvXX chips ON, then OFF (before/after)
//   recal     — a mini GEOM SWAP EDITOR (ReCal's per-glyph rows): the cursor
//               drags a glyph's swap point across the current GEOM value and
//               that letter alone flips form in the word — the decision ReCal
//               bakes into a renamed export
//
// All ways phase off a GLOBAL clock (performance.now()), so instances stay in
// lockstep no matter when they mount — same contract as CalAxes.
// ─────────────────────────────────────────────────────────────────────────────

const VER = CAL_SANS

// Non-animated axes rest at the font defaults (mirrors CalAxes).
const DEFAULTS = { opsz: 14, GEOM: 25, wght: 400, YTAS: 1440, SHRP: 0, ital: 0 }
const DEFAULT_FVS = `"opsz" ${DEFAULTS.opsz}, "GEOM" ${DEFAULTS.GEOM}, "wght" ${DEFAULTS.wght}, "YTAS" ${DEFAULTS.YTAS}, "SHRP" ${DEFAULTS.SHRP}, "ital" ${DEFAULTS.ital}`

// GEOM landing bands from the diagnostic sheet (CalSansVF-GEOM-v10): where the
// four named forms live on the axis. Same palette as CalGraphics' cube.
const GEOM_BANDS = [
    { from: 0, to: 10, color: "#ff6b35" }, // A11y
    { from: 16, to: 34, color: "#242424" }, // UI · default
    { from: 40, to: 60, color: "#009efc" }, // Base
    { from: 80, to: 100, color: "#02c30e" }, // Geo
]

// Way 2 steps. Tags follow the CURRENT 20-set build's numbering (the scheme
// CalFeatureSpecimen uses — GlyphPicker/CalGraphics still carry the older map).
// Each word exists to show its feature's glyphs, so they're baked, not props.
// CONSECUTIVE steps that share a word form a GROUP: the headline stays put, the
// cursor still travels and clicks each chip, and the group's features stack —
// that's the cv26+cv27 pair demonstrating per-glyph cvXX power on one equation.
// Everywhere else the word changes, so the headline slides while the cursor moves.
const FEATURE_STEPS = [
    { tag: "ss01", word: "adaptable" }, // geometric a
    { tag: "ss05", word: "goggles" }, // gothic g
    { tag: "ss10", word: "Counter form" }, // futura alternatives
    { tag: "ss11", word: "affluent Chai" }, // futura alternatives and ligations
    { tag: "cv12", word: "Illinois" }, // accessible I
    { tag: "cv24", word: "Formula 1" }, // futura-style one
    { tag: "cv26", word: "6⁶ ≠ 9" }, // humanist 6
    { tag: "cv27", word: "6⁶ ≠ 9" }, // humanist 9
]
// First step of the group a step belongs to (groups are consecutive same-word).
const groupStartOf = (i: number) => {
    let s = i
    while (s > 0 && FEATURE_STEPS[s - 1].word === FEATURE_STEPS[i].word) s--
    return s
}

// Way 3: the GEOM SWAP EDITOR rows, miniature. Each row is a glyph whose swap
// point can be dragged; crossing the current GEOM flips that letter's form.
// The live flip is faked with the glyph's cvXX geo alternate — visually the same
// thing the baked export does. Rendered with the v2 face (NOT the committed
// ReCal CDN build, which is v1.953 and predates the current 42-cv scheme).
const SWAP_WORD = "gateway"
const SWAP_ROWS = [
    { glyph: "a", tag: "cv01" }, // geometric a
    { glyph: "g", tag: "cv09" }, // double-story g
    { glyph: "t", tag: "cv19" }, // futura-style t
    { glyph: "y", tag: "cv22" }, // geometric y
]
// LEFT of the threshold is the DEFAULT form — the word as GEOM 25 already
// renders it — and dragging RIGHT past the line is what swaps in the alternate.
// (It used to be the other way round, which read backwards: the resting state on
// the left was the changed one.)
//
// Tied to DEFAULTS.GEOM rather than repeating 25: this value both draws the
// threshold line and decides when a row flips, so a second copy could drift and
// leave the line pointing somewhere the flip doesn't actually happen.
const GEOM_NOW = DEFAULTS.GEOM
const OFF_PCT = 8 // default form, left of the line
const ON_PCT = 78 // alternate, right of the line

// Cubic ease-in-out ("easy ease"): zero velocity at 0 and 1 → smooth turnarounds.
const easeInOut = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// geom: CalAxes cycle — 0.8s drag up / 0.2s hold / 0.8s drag down / 0.2s hold.
const MOVE = 800
const HOLD = 200
const GEOM_CYCLE = 2 * (MOVE + HOLD)
// features: arrive at 0, HOLD 1s, click at 1000 (that's when the glyph flips),
// dwell lit, then travel to the next chip 2400→3000. No OFF-click — the
// previous chip FADES to disabled (CSS transition) while the cursor moves
// away, and the headline slides during the same window whenever the next
// step's word differs. 3s step (1.5× the 2s beat) so the pause fits.
const FEAT_STEP = 3000
const FEAT_CLICK_AT = 1000
const FEAT_TRAVEL_AT = 2400
const FEAT_TRAVEL = FEAT_STEP - FEAT_TRAVEL_AT
const FEAT_CYCLE = FEATURE_STEPS.length * FEAT_STEP
// recal: per 2s step — travel to the handle (0→400), drag it across (400→1400),
// dwell. First half of the cycle drags each row ON, second half drags them OFF.
const SWAP_STEP = 2000
const SWAP_GRAB = 400
const SWAP_RELEASE = 1400
const SWAP_STEPS = SWAP_ROWS.length * 2
const SWAP_CYCLE = SWAP_STEPS * SWAP_STEP
// Cursor dips for ~120ms on every click.
const CLICK_MS = 120

// ── Control geometry ─────────────────────────────────────────────────────────
// The demo's size at Control Scale 100%. Every number is multiplied by that one
// prop, which is INDEPENDENT of Size — the word and the demo are sized
// separately, so each prop's value means exactly what it says at any breakpoint.
const BASE = {
    gap: 22, // word → control
    // One reserved band for the control, whatever the way. The three demos are
    // very different heights (slider 40, chip row ~20, swap editor 4×24=96), and
    // without a fixed band each card centres a different-height block — so the
    // space between word and card bottom visibly differed per card. Sized to the
    // tallest (the swap editor); the shorter two centre inside it.
    controlZone: 96,
    trackW: 240,
    sliderH: 40,
    trackTop: 22,
    trackH: 4,
    handle: 14,
    handleRing: 2.5,
    bubbleW: 28,
    bubbleFont: 9,
    chipFont: 10,
    chipPadY: 5,
    chipPadX: 9,
    chipGap: 6,
    chipRadius: 6,
    rowH: 24,
    labelW: 20,
    miniW: 160,
    rowLabelFont: 12,
    diamond: 12,
    cursor: 18,
}
type Geo = Record<keyof typeof BASE, number>
const geoAt = (scale: number): Geo =>
    Object.fromEntries(
        Object.entries(BASE).map(([k, v]) => [k, v * scale])
    ) as Geo

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pctToX = (pct: number, g: Geo) => g.labelW + (pct / 100) * g.miniW

// Handle position (axis units) of row i during swap-step k at drag progress p.
function swapPct(i: number, k: number, p: number) {
    const toOn = k < SWAP_ROWS.length
    const r = k % SWAP_ROWS.length
    if (i < r) return toOn ? ON_PCT : OFF_PCT
    if (i > r) return toOn ? OFF_PCT : ON_PCT
    return toOn ? lerp(OFF_PCT, ON_PCT, p) : lerp(ON_PCT, OFF_PCT, p)
}

// Classic pointer arrow, hotspot at the tip (top-left of the viewBox). `size`
// scales with the word; `scale` stays free for the click dip.
function Cursor({ x, y, scale, size }: any) {
    return (
        <motion.div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                x,
                y,
                scale,
                transformOrigin: "2px 2px",
                pointerEvents: "none",
                zIndex: 2,
            }}
        >
            <svg width={size} height={size} viewBox="0 0 20 20">
                <path
                    d="M3 1 L3 15.5 L7 12 L9.5 17.5 L12 16.4 L9.6 11 L15 11 Z"
                    fill="#242424"
                    stroke="#fff"
                    strokeWidth="1.2"
                />
            </svg>
        </motion.div>
    )
}

/**
 * `any` lets Framer OFFER Fill/Fixed. It does not by itself make the component
 * take the space — the root has to consume what Framer hands it, which is why
 * the root spreads `style` LAST and defaults to `fit-content` rather than
 * `inline-flex`. See the root div.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function CalThreeWaysCard(props: any) {
    const { way, text, fontSize, boxWidth, controlScale, color, debug, style } =
        props

    // One scale for the whole demo, driven ONLY by Control Scale — deliberately
    // independent of Size. Deriving it from the word meant "100%" described no
    // particular size: you had to know Size and do the arithmetic to know what
    // you'd get. Now 100% is the geometry in BASE, full stop, and the two props
    // are separately legible per breakpoint.
    const G = React.useMemo(() => geoAt(controlScale / 100), [controlScale])
    // The frame loop must read the CURRENT geometry — a stale closure would keep
    // driving handles to the old scale's coordinates after a resize.
    const gRef = React.useRef(G)
    gRef.current = G

    const fvs = useMotionValue(DEFAULT_FVS)
    const handleX = useMotionValue(0)
    const geomLabel = useMotionValue("25")
    const cursorX = useMotionValue(0)
    const cursorY = useMotionValue(0)
    const cursorScale = useMotionValue(1)
    // One motion value per swap row (fixed count, so a lazy ref is safe).
    const rowX = React.useRef<ReturnType<typeof motionValue<number>>[] | null>(null)
    if (!rowX.current)
        rowX.current = SWAP_ROWS.map(() => motionValue(pctToX(OFF_PCT, G)))
    // Headline slide during cursor travel (features way only).
    const wordX = useMotionValue(0)
    const wordOpacity = useMotionValue(1)
    // Step flips change WORDS and glyph forms, not just styles — state, but
    // guarded so renders happen only on a flip. `wi` = which step's word shows
    // (swaps at the slide midpoint); `on` = each chip's lit state.
    const [feat, setFeat] = React.useState(() => ({
        wi: 0,
        on: FEATURE_STEPS.map(() => false),
    }))
    const [rowOn, setRowOn] = React.useState(() => SWAP_ROWS.map(() => false))

    // Chip centres in control-box coordinates, for the cursor's waypoints.
    // Measured (labels set their own widths) — after fonts land, since the row
    // reflows when the real face swaps in.
    const itemRefs = React.useRef<(HTMLElement | null)[]>([])
    const pts = React.useRef<{ x: number; y: number }[]>([])
    const measure = React.useCallback(() => {
        pts.current = itemRefs.current
            .filter(Boolean)
            .map((el) => ({
                x: el!.offsetLeft + el!.offsetWidth / 2,
                y: el!.offsetTop + el!.offsetHeight / 2,
            }))
    }, [])
    React.useLayoutEffect(() => {
        // Do NOT clear itemRefs here — the ref callbacks populated it during
        // this very commit, and wiping it left the waypoint list empty (the
        // cursor clicked in one spot forever). Only features assigns refs, so
        // there's nothing stale to flush.
        measure()
        document.fonts?.ready.then(measure)
    }, [way, measure])

    // Global-clock phase: every instance reads the same performance.now().
    useAnimationFrame(() => {
        const now = performance.now()
        // A way-switch mid-slide would strand the headline offset.
        if (way !== "features") {
            wordX.set(0)
            wordOpacity.set(1)
        }
        if (way === "geom") {
            const t = now % GEOM_CYCLE
            let prog: number
            if (t < MOVE) prog = easeInOut(t / MOVE)
            else if (t < MOVE + HOLD) prog = 1
            else if (t < 2 * MOVE + HOLD)
                prog = easeInOut(1 - (t - MOVE - HOLD) / MOVE)
            else prog = 0
            const g = prog * 100
            fvs.set(
                `"opsz" ${DEFAULTS.opsz}, "GEOM" ${g.toFixed(1)}, "wght" ${DEFAULTS.wght}, "YTAS" ${DEFAULTS.YTAS}, "SHRP" ${DEFAULTS.SHRP}, "ital" ${DEFAULTS.ital}`
            )
            const gg = gRef.current
            handleX.set(prog * gg.trackW)
            geomLabel.set(g.toFixed(0))
            // The cursor IS the drag: tip rides the handle's centre, held down
            // throughout. The svg tip sits ~(3,1) into the cursor box, and the
            // track centre is one bubble-row below the top — both scale.
            cursorX.set(prog * gg.trackW - 3 * (gg.cursor / BASE.cursor))
            cursorY.set(gg.trackTop + gg.trackH / 2)
            cursorScale.set(0.92)
        } else if (way === "features") {
            const t = now % FEAT_CYCLE
            const i = Math.floor(t / FEAT_STEP)
            const local = t % FEAT_STEP
            const next = (i + 1) % FEATURE_STEPS.length
            const sameWord = FEATURE_STEPS[next].word === FEATURE_STEPS[i].word
            // 0 → 1 across the travel window, unfiltered; each consumer eases it.
            const raw =
                local < FEAT_TRAVEL_AT
                    ? 0
                    : (local - FEAT_TRAVEL_AT) / FEAT_TRAVEL
            // Lit chips: the current word's group, up to the last CLICKED step
            // — this step joins only after the 1s pause ends at FEAT_CLICK_AT.
            // Group predecessors stay lit while the cursor moves WITHIN the
            // group (cv26 holds while cv27 is clicked); leaving the group they
            // all fade out mid-travel.
            const litThrough =
                raw > 0 && !sameWord && raw >= 0.5
                    ? -1
                    : local >= FEAT_CLICK_AT
                      ? i
                      : i - 1
            const gs = groupStartOf(i)
            const on = FEATURE_STEPS.map(
                (_, idx) => litThrough >= 0 && idx >= gs && idx <= litThrough
            )
            // Headline: slides out left over the travel's first half, swaps at
            // the midpoint, slides in from the right — unless the word repeats.
            const slide = (fontSize / 0.75) * 1.2
            let wi = i
            if (raw > 0 && !sameWord) {
                if (raw < 0.5) {
                    const p = easeInOut(raw * 2)
                    wordX.set(-slide * p)
                    wordOpacity.set(1 - p)
                } else {
                    wi = next
                    const p = easeInOut((raw - 0.5) * 2)
                    wordX.set(slide * (1 - p))
                    wordOpacity.set(p)
                }
            } else {
                wordX.set(0)
                wordOpacity.set(1)
            }
            setFeat((prev) =>
                prev.wi === wi && prev.on.join() === on.join()
                    ? prev
                    : { wi, on }
            )
            const p = pts.current
            if (p.length) {
                const here = p[i % p.length]
                const to = p[next % p.length]
                const travel = easeInOut(raw)
                cursorX.set(lerp(here.x, to.x, travel))
                cursorY.set(lerp(here.y, to.y, travel))
            }
            cursorScale.set(
                local >= FEAT_CLICK_AT && local < FEAT_CLICK_AT + CLICK_MS
                    ? 0.82
                    : 1
            )
        } else {
            const t = now % SWAP_CYCLE
            const k = Math.floor(t / SWAP_STEP)
            const local = t % SWAP_STEP
            const r = k % SWAP_ROWS.length
            const drag =
                local < SWAP_GRAB
                    ? 0
                    : local < SWAP_RELEASE
                      ? easeInOut((local - SWAP_GRAB) / (SWAP_RELEASE - SWAP_GRAB))
                      : 1
            // Every handle + flip state is derived from the clock, so a mount at
            // any time lands mid-cycle in a consistent editor.
            const gg = gRef.current
            const nextOn: boolean[] = []
            for (let i = 0; i < SWAP_ROWS.length; i++) {
                const pct = swapPct(i, k, drag)
                rowX.current![i].set(pctToX(pct, gg) - gg.diamond / 2)
                // Right of the line = alternate on. Left = default.
                nextOn.push(pct > GEOM_NOW)
            }
            setRowOn((prev) =>
                prev.join() === nextOn.join() ? prev : nextOn
            )
            // Cursor: approach this step's handle during the grab window, then
            // ride it through the drag.
            const rowPct = swapPct(r, k, drag)
            const hx = pctToX(rowPct, gg)
            const hy = r * gg.rowH + gg.rowH / 2
            if (local < SWAP_GRAB) {
                const pk = (k + SWAP_STEPS - 1) % SWAP_STEPS
                const pr = pk % SWAP_ROWS.length
                const px = pctToX(swapPct(pr, pk, 1), gg)
                const py = pr * gg.rowH + gg.rowH / 2
                const a = easeInOut(local / SWAP_GRAB)
                cursorX.set(lerp(px, hx, a))
                cursorY.set(lerp(py, hy, a))
            } else {
                cursorX.set(hx)
                cursorY.set(hy)
            }
            cursorScale.set(local >= SWAP_GRAB && local < SWAP_RELEASE ? 0.92 : 1)
        }
    })

    const word =
        way === "features"
            ? FEATURE_STEPS[feat.wi].word
            : way === "recal"
              ? SWAP_WORD
              : text
    // Explicit `tag 0` (not "normal") so OFF is the same declaration as ON.
    // Every tag is declared so grouped steps (cv26+cv27) stack cleanly.
    const featureSettings =
        way === "features"
            ? FEATURE_STEPS.map(
                  (s, i) => `"${s.tag}" ${feat.on[i] ? 1 : 0}`
              ).join(", ")
            : way === "recal"
              ? SWAP_ROWS.map(
                    (r, i) => `"${r.tag}" ${rowOn[i] ? 1 : 0}`
                ).join(", ")
              : "normal"

    // Version badge — dev-only probe, standard house pattern.
    const [probe, setProbe] = React.useState("…")
    const [loaded, setLoaded] = React.useState(false)
    React.useEffect(() => {
        if (!debug) return
        let alive = true
        setProbe("probing…")
        readFontRevision(VER.url).then((r) => alive && setProbe(r))
        const check = () =>
            alive && setLoaded(document.fonts.check(`400 24px "${VER.family}"`))
        check()
        document.fonts.ready.then(check)
        return () => {
            alive = false
        }
    }, [debug])

    const wordStyle: React.CSSProperties = {
        fontFamily: `"${VER.family}", sans-serif`,
        fontSize: fontSize / 0.75, // Size is in POINTS → px is ÷0.75
        fontOpticalSizing: "none", // opsz comes from the fvs, not the size
        lineHeight: 1.2,
        whiteSpace: "pre",
    }

    const chipBase: React.CSSProperties = {
        padding: `${G.chipPadY}px ${G.chipPadX}px`,
        borderRadius: G.chipRadius,
        fontFamily: `"${VER.family}", sans-serif`,
        fontSize: G.chipFont,
        fontVariationSettings: '"wght" 500, "GEOM" 25',
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
        userSelect: "none",
        // The "click" lights a chip instantly enough, and the same transition
        // is what fades a chip back to disabled as the cursor walks away.
        transition: "background 0.35s ease, color 0.35s ease",
    }

    return (
        <div
            style={{
                position: "relative",
                // FILLS its container rather than hugging the widest word. Hugging
                // made the parent card inherit a width that changed per instance
                // ("Geometry" vs "affluent Chai"), which dragged everything else in
                // the card — a corner badge sat at the word's edge, not the card's.
                // Filling decouples them: the card owns the width, this centres in it.
                // (An `inline-flex` root can't do this — it shrink-wraps whatever the
                // parent says, which is why setting Fill in Framer looked broken.)
                display: "flex",
                width: "100%",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center", // centres content when given a height
                gap: G.gap,
                overflow: "visible", // never clip glyphs — the card provides padding
                color,
                // Framer's own layout sizing (Fill / Fixed) beats the default fill.
                ...style,
                // Box Width beats EVERYTHING when set — it's an explicit instruction
                // from the panel, and being a property control it can be driven by a
                // Framer variable per breakpoint, which the layout Width field can't
                // be. 0 = off, so the fill above stands.
                ...(boxWidth > 0 ? { width: boxWidth } : null),
            }}
        >
            {/* No width ghosts. They existed to reserve the WIDEST word so the
                controls couldn't shift when the word swapped — necessary back when
                the root hugged its content. Now the root's width comes from the
                container (or Box Width), so the word centres inside a box it does
                not size, and nothing below it can move. Keeping the ghosts only
                imposed a floor the component could never shrink under — which is
                what made it feel forced wider than the visible word. */}
            <motion.div
                style={{
                    ...wordStyle,
                    x: wordX,
                    opacity: wordOpacity,
                    fontVariationSettings: fvs,
                    fontFeatureSettings: featureSettings,
                }}
            >
                {word}
            </motion.div>

            {/* Fixed-height band so every way reserves the SAME space under the
                word — the control centres inside it instead of resizing the block
                and shifting everything else in the card. */}
            <div
                style={{
                    height: G.controlZone,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
            {way === "geom" && (
                <div
                    style={{
                        position: "relative",
                        width: G.trackW,
                        height: G.sliderH,
                    }}
                >
                    {/* Value bubble riding the handle, like the sheet's readout */}
                    {/* NOTE: no translate offsets on motion.divs here — motion owns
                        `transform` (it composes it from x/scale), so a static
                        translateX/Y is silently discarded. Offsets live in
                        left/top instead. */}
                    <motion.div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: -G.bubbleW / 2,
                            width: G.bubbleW,
                            textAlign: "center",
                            x: handleX,
                            background: "#242424",
                            color: "#fff",
                            borderRadius: G.chipRadius * 0.67,
                            padding: `${G.bubbleFont * 0.22}px ${G.bubbleFont * 0.55}px`,
                            // Cal Sans at UI form with tabular figures — not the
                            // mono the readout first shipped with.
                            fontFamily: `"${VER.family}", sans-serif`,
                            fontSize: G.bubbleFont,
                            lineHeight: 1,
                            fontVariationSettings: '"wght" 500, "GEOM" 25',
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        <motion.span>{geomLabel}</motion.span>
                    </motion.div>
                    {/* Track + the four landing bands from the diagnostic sheet */}
                    <div
                        style={{
                            position: "absolute",
                            top: G.trackTop,
                            width: "100%",
                            height: G.trackH,
                            borderRadius: G.trackH / 2,
                            background: "#e8e8ea",
                        }}
                    />
                    {GEOM_BANDS.map((b) => (
                        <div
                            key={b.from}
                            style={{
                                position: "absolute",
                                top: G.trackTop,
                                left: `${b.from}%`,
                                width: `${b.to - b.from}%`,
                                height: G.trackH,
                                borderRadius: G.trackH / 2,
                                background: b.color,
                            }}
                        />
                    ))}
                    {/* Handle, centred ON the track */}
                    <motion.div
                        style={{
                            position: "absolute",
                            top: G.trackTop + G.trackH / 2 - G.handle / 2,
                            left: -G.handle / 2,
                            x: handleX,
                            width: G.handle,
                            height: G.handle,
                            borderRadius: "50%",
                            background: "#fff",
                            border: `${G.handleRing}px solid #242424`,
                            boxSizing: "border-box",
                        }}
                    />
                    <Cursor
                        x={cursorX}
                        y={cursorY}
                        scale={cursorScale}
                        size={G.cursor}
                    />
                </div>
            )}

            {way === "features" && (
                <div
                    style={{
                        position: "relative",
                        display: "flex",
                        gap: G.chipGap,
                    }}
                >
                    {FEATURE_STEPS.map((s, i) => {
                        const active = feat.on[i]
                        return (
                            <div
                                key={s.tag}
                                ref={(el) => (itemRefs.current[i] = el)}
                                style={{
                                    ...chipBase,
                                    background: active ? "#242424" : "#F3F4F6",
                                    color: active ? "#fff" : "#8E8E8E",
                                }}
                            >
                                {s.tag}
                            </div>
                        )
                    })}
                    <Cursor
                        x={cursorX}
                        y={cursorY}
                        scale={cursorScale}
                        size={G.cursor}
                    />
                </div>
            )}

            {way === "recal" && (
                <div
                    style={{
                        position: "relative",
                        width: G.labelW + G.miniW,
                        height: SWAP_ROWS.length * G.rowH,
                    }}
                >
                    {/* The current GEOM value — the line a swap point has to
                        cross for the export to change at today's setting */}
                    <div
                        style={{
                            position: "absolute",
                            left: pctToX(GEOM_NOW, G),
                            top: 0,
                            bottom: 0,
                            width: 1,
                            background: "#d5d5d8",
                        }}
                    />
                    {SWAP_ROWS.map((row, i) => (
                        <div
                            key={row.glyph}
                            style={{
                                position: "absolute",
                                top: i * G.rowH,
                                left: 0,
                                width: "100%",
                                height: G.rowH,
                            }}
                        >
                            {/* Row label flips WITH the word — same feature flag */}
                            <div
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    width: G.labelW,
                                    lineHeight: `${G.rowH}px`,
                                    fontFamily: `"${VER.family}", sans-serif`,
                                    fontSize: G.rowLabelFont,
                                    fontFeatureSettings: `"${row.tag}" ${rowOn[i] ? 1 : 0}`,
                                    color: rowOn[i] ? color : "#8E8E8E",
                                }}
                            >
                                {row.glyph}
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    left: G.labelW,
                                    top: G.rowH / 2 - G.trackH / 4,
                                    width: G.miniW,
                                    height: G.trackH / 2,
                                    borderRadius: G.trackH / 4,
                                    background: "#e8e8ea",
                                }}
                            />
                            {/* Diamond swap handle, like ReCal's editor */}
                            <motion.div
                                style={{
                                    position: "absolute",
                                    top: G.rowH / 2 - G.diamond / 2,
                                    left: 0,
                                    x: rowX.current![i],
                                    width: G.diamond,
                                    height: G.diamond,
                                    background: "#fff",
                                    border: `${G.handleRing * 0.8}px solid #242424`,
                                    boxSizing: "border-box",
                                    rotate: 45,
                                }}
                            />
                        </div>
                    ))}
                    <Cursor
                        x={cursorX}
                        y={cursorY}
                        scale={cursorScale}
                        size={G.cursor}
                    />
                </div>
            )}
            </div>

            {debug && (
                <div style={badgeStyle}>
                    <div style={{ fontWeight: 700 }}>Version report</div>
                    <div>
                        binary: {probe}
                    </div>
                    <div>face loaded: {loaded ? "✓" : "✗"}</div>
                </div>
            )}
            <style
                dangerouslySetInnerHTML={{ __html: buildFontFaceCSS(VER) }}
            />
        </div>
    )
}

CalThreeWaysCard.defaultProps = {
    way: "geom",
    text: "Geometry",
    fontSize: 90,
    boxWidth: 0,
    controlScale: 100,
    color: "#111111",
    debug: false,
}

addPropertyControls(CalThreeWaysCard, {
    way: {
        type: ControlType.Enum,
        title: "Way",
        options: ["geom", "features", "recal"],
        optionTitles: ["GEOM Axis", "ssXX · cvXX", "ReCal Sans"],
        defaultValue: "geom",
        displaySegmentedControl: true,
    },
    text: {
        type: ControlType.String,
        title: "Text",
        defaultValue: "Geometry",
        // features/recal words are baked — they exist to show specific glyphs.
        hidden: (p) => p.way !== "geom",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Size",
        defaultValue: 90,
        min: 6,
        max: 600,
        step: 1,
        unit: "pt",
    },
    // Sizes the demo INDEPENDENTLY of Size, so a breakpoint can shrink the word
    // without shrinking the controls (or vice versa). 100% = the geometry in BASE.
    controlScale: {
        type: ControlType.Number,
        title: "Control Scale",
        defaultValue: 100,
        min: 25,
        max: 200,
        step: 5,
        unit: "%",
        description: "Demo UI size — independent of Size",
    },
    // A property (not the layout Width field) so it can take a Framer VARIABLE and
    // therefore differ per breakpoint. 0 = fill the container.
    boxWidth: {
        type: ControlType.Number,
        title: "Box Width",
        defaultValue: 0,
        min: 0,
        max: 2400,
        step: 10,
        unit: "px",
        description: "0 = fill container",
    },
    color: { type: ControlType.Color, title: "Color", defaultValue: "#111111" },
    debug: { type: ControlType.Boolean, title: "Debug Badge" },
})

const badgeStyle: React.CSSProperties = {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 99999,
    background: "rgba(20,20,20,0.85)",
    color: "#E6FF7A",
    font: "11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",
    padding: "8px 10px",
    borderRadius: 8,
    pointerEvents: "none",
    whiteSpace: "pre",
}
