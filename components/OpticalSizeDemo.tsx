import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useScroll, useTransform } from "framer-motion"
// Font-version machinery lives in Shared.tsx (Phase 2). Re-Copy-Import after any
// Shared edit — the @<hash> in the URL is a version pin.
import {
    CAL_SANS,
    buildFontFaceCSS,
    readFontRevision,
} from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"

/**
 * Scroll-driven optical-size demo: a type scale (8pt → text-6xl) slides up the
 * left margin past a fixed needle while two sentences demonstrate the font —
 * Row 1 holds one size (shape morphs via opsz), Row 2 scales up.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 3000
 */

const VER = CAL_SANS

// opsz axis range (VISION §1): min / default / max.
const OPSZ_MIN = 8
const OPSZ_MAX = 45

// Tailwind-style type scale shown on the left-margin ruler (3 units each).
// First mark is the font's optical floor (8pt) — no Tailwind analog.
const TYPE_SCALE = [
    { name: "—", px: 10.7, pt: "8pt" },
    { name: "text-xs", px: 12, pt: "9pt" },
    { name: "text-sm", px: 14, pt: "10.5pt" },
    { name: "text-base", px: 16, pt: "12pt" },
    { name: "text-lg", px: 18, pt: "13.5pt" },
    { name: "text-xl", px: 20, pt: "15pt" },
    { name: "text-2xl", px: 24, pt: "18pt" },
    { name: "text-3xl", px: 30, pt: "22.5pt" },
    { name: "text-4xl", px: 36, pt: "27pt" },
    { name: "text-5xl", px: 48, pt: "36pt" },
    { name: "text-6xl", px: 60, pt: "45pt" },
]

// Project orange — the accent a mark takes on as it rides past the needle, and the
// color of the live caption readouts.
const ACCENT = "#ff6b35"

// Interpolate between two hex colors (#rgb or #rrggbb) at t ∈ [0,1] in sRGB.
function hexLerp(a: string, b: string, t: number) {
    const parse = (h: string) => {
        h = h.replace("#", "")
        if (h.length === 3)
            h = h
                .split("")
                .map((c) => c + c)
                .join("")
        return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
    }
    const [ar, ag, ab] = parse(a)
    const [br, bg, bb] = parse(b)
    const m = (x: number, y: number) => Math.round(x + (y - x) * t)
    return `rgb(${m(ar, br)}, ${m(ag, bg)}, ${m(ab, bb)})`
}

// Marks are non-linear in pt, so map an opsz VALUE (pt) → fractional mark index by
// inverse-interpolating the pt column. Lets the needle point at pt == current opsz.
const PT = TYPE_SCALE.map((s) => parseFloat(s.pt))
function ptToIndex(v: number) {
    if (v <= PT[0]) return 0
    for (let i = 1; i < PT.length; i++) {
        if (v <= PT[i]) return i - 1 + (v - PT[i - 1]) / (PT[i] - PT[i - 1])
    }
    return PT.length - 1
}

// Smooth top+bottom fade MASK for the ruler. `size` px = the actual opacity-fade
// LENGTH at each end (works on the line + marks regardless of their own opacity).
// Alpha follows smootherstep so there's no visible band or hard edge.
// Top+bottom fade mask with INDEPENDENT lengths (px), anchored at the element's own
// top & bottom edges. Solid in between; smootherstep alpha so there's no visible band.
// A 0 length means that end stays fully solid.
function buildMask(topSize: number, botSize: number) {
    if (topSize <= 0 && botSize <= 0) return "none"
    const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
    const N = 8
    const parts: string[] = []
    if (topSize > 0) {
        for (let i = 0; i <= N; i++) {
            const t = i / N
            parts.push(
                `rgba(0,0,0,${smooth(t).toFixed(3)}) ${(t * topSize).toFixed(1)}px`
            )
        }
    } else {
        parts.push("black 0")
    }
    if (botSize > 0) {
        for (let i = 0; i <= N; i++) {
            const t = i / N
            parts.push(
                `rgba(0,0,0,${smooth(1 - t).toFixed(3)}) calc(100% - ${((1 - t) * botSize).toFixed(1)}px)`
            )
        }
    } else {
        parts.push("black 100%")
    }
    return `linear-gradient(to bottom, ${parts.join(", ")})`
}

// One mark on the scrolling tape. Desktop: label right-aligned, ending at the
// needle (left margin). Mobile: tick at the axis + label reading rightward into
// the column (over the bleeding specimen), spotlighting the mark at the needle
// so the riding numbers don't clutter.
function TapeMark({ s, i, tickGap, mobile, color, needleIndex }) {
    // Proximity is measured against the tape's OWN coordinate — the fractional mark
    // index at the needle (ptToIndex of the live opsz) — NOT scrollYProgress. The pt
    // scale is non-linear, so those two spaces diverge and the scroll-space version
    // highlighted the wrong mark. `span` = half a tick, so influence spans one gap.
    const span = 0.5
    // Spotlight the zone passing the needle; the rest of the tape fades back (both
    // breakpoints). Callback form (not an input range) so it isn't WAAPI-compiled
    // into keyframe offsets, which must be in [0,1] — edge marks fall outside.
    const spotlight = useTransform(needleIndex, (idx) => {
        const t = Math.min(1, Math.abs(idx - i) / span)
        return 0.35 + (0.95 - 0.35) * (1 - t)
    })
    // Same proximity, applied as COLOR: the mark riding past the needle warms to the
    // accent; the rest stay the base color. (1 - t) so t=0 at the needle → full accent.
    const markColor = useTransform(needleIndex, (idx) => {
        const t = Math.min(1, Math.abs(idx - i) / span)
        return hexLerp(color, ACCENT, 1 - t)
    })

    return (
        <motion.div
            style={{
                position: "absolute",
                top: i * tickGap,
                // Mobile: tick at the axis (left) with the label reading RIGHTWARD into
                // the column. Desktop: label right-aligned, ending at the axis (right).
                left: mobile ? 0 : undefined,
                right: mobile ? undefined : 0,
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: mobile ? "row" : "row-reverse",
                alignItems: "center",
                gap: 8,
                opacity: spotlight,
                color: markColor,
            }}
        >
            <div
                style={{
                    width: 8,
                    height: 1,
                    background: "currentColor",
                    flex: "none",
                }}
            />
            <div
                style={{
                    textAlign: mobile ? "left" : "right",
                    fontFamily: `"${VER.family}", sans-serif`,
                    fontVariationSettings: "'GEOM' 0",
                    fontSize: "8pt",
                    lineHeight: 1.15,
                    textTransform: "lowercase",
                    color: "currentColor",
                    whiteSpace: "nowrap",
                }}
            >
                <div>{s.name}</div>
                <div>{s.px}px</div>
                <div>{s.pt}</div>
            </div>
        </motion.div>
    )
}

// Caption FVS with the italic axis on. Restates wght/GEOM because
// font-variation-settings replaces (not merges with) the parent's.
const ITALIC_FVS = "'wght' 700, 'GEOM' 100, 'ital' 1"

// Split a caption tail on "·" and italicise the text after each bullet (true
// italic via the font's `ital` axis — no faux slant). Bullets stay upright.
function withItalicTail(text: string) {
    const parts = text.split("·")
    return (
        <>
            {parts[0]}
            {parts.slice(1).map((seg, i) => (
                <React.Fragment key={i}>
                    ·
                    <span style={{ fontStyle: "italic", fontVariationSettings: ITALIC_FVS }}>
                        {seg}
                    </span>
                </React.Fragment>
            ))}
        </>
    )
}

export default function OpticalSizeDemo(props) {
    const {
        text,
        scrollLength,
        tickGap,
        desktopPadding,
        mobilePadding,
        breakpoint,
        textGap,
        textWidth,
        topOffset,
        needlePos,
        fixedSize,
        label1,
        label2,
        color,
        backgroundColor,
        gradientSize,
        gradientMode,
        debug,
    } = props

    const containerRef = React.useRef(null)

    // Responsive left margin where the scale lives — exposed as a property.
    const [isMobile, setIsMobile] = React.useState(false)
    React.useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
        const on = () => setIsMobile(mq.matches)
        on()
        mq.addEventListener("change", on)
        return () => mq.removeEventListener("change", on)
    }, [breakpoint])
    const sidePad = isMobile ? mobilePadding : desktopPadding
    const textInset = sidePad + textGap

    // Glue words onto one line with a `~` between them — e.g. "for~absolutely".
    // Framer normalizes a real non-breaking space on input, so the tilde token is
    // the reliable way; it's converted to a real   here at render time.
    const displayText = text.replace(/\s*~\s*|&nbsp;/g, "\u00A0")

    // Pin the inner stage while the tall root scrolls past: progress 0 → 1.
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    })

    // Scroll → optical size, shared by both rows.
    const opsz = useTransform(scrollYProgress, [0, 1], [OPSZ_MIN, OPSZ_MAX])
    // opsz is a continuous axis — 2 decimals keeps the morph as fine as the readout.
    const fvs = useTransform(opsz, (v) => `'opsz' ${v.toFixed(2)}`)

    // Row 2 renders at the ACTUAL optical point size, so its PT readout equals the
    // OPSZ value (px = pt / 0.75) — the same number as Row 1 and the ruler, not an
    // independent ramp. Grows 8pt → 45pt as opsz sweeps.
    const rampSize = useTransform(opsz, (v) => v / 0.75)

    // Live readouts for the captions: row 1 shows the opsz axis value, row 2
    // shows its actual point size (px → pt at 0.75, matching the ruler).
    const opszLabel = useTransform(opsz, (v) => v.toFixed(2))
    const ptLabel = useTransform(rampSize, (v) => (v * 0.75).toFixed(2))

    // Value-driven: put the mark whose pt == current opsz at the needle. Marks are
    // non-linear so this isn't a straight scroll lerp — but it still scrolls (opsz
    // ramps with scroll, the tape follows opsz).
    const scaleY = useTransform(opsz, (v) => -ptToIndex(v) * tickGap)
    // Fractional mark index at the needle — the SAME value that positions the tape.
    // Marks highlight by their distance from this, so the lit mark is always the one
    // sitting on the needle (see TapeMark).
    const needleIndex = useTransform(opsz, (v) => ptToIndex(v))

    // Sticky: line + ticks fade at the fixed screen edges (Fade Size = length there).
    // Absolute: line stays fully solid (like the left border) and the ticks fade only
    // at the scale's own ends, which is handled by a scroll-driven mask below.
    const sticky = gradientMode === "sticky"
    const rulerMask = buildMask(gradientSize, gradientSize)

    // Version badge — what the loaded BINARY actually reports. Dev-only: skip the
    // probe fetch + parse entirely unless the badge is shown, so production
    // instances don't each re-fetch and DataView-parse the whole TTF.
    const [probe, setProbe] = React.useState("…")
    const [loaded, setLoaded] = React.useState(false)
    React.useEffect(() => {
        if (!debug) return
        let alive = true
        setProbe("probing…")
        readFontRevision(VER.url).then((r) => alive && setProbe(r))
        const face = `400 24px "${VER.family}"`
        const check = () => alive && setLoaded(document.fonts.check(face))
        check()
        document.fonts.ready.then(check)
        return () => {
            alive = false
        }
    }, [debug])

    // Measure Row 1's baseline (bottom) relative to the pinned stage, so the
    // needle + tape sit on it. Fixed Text Width ⇒ this only changes with viewport
    // height, not browser width — so it stays put.
    const stageRef = React.useRef<HTMLDivElement>(null)
    const row1Ref = React.useRef<HTMLParagraphElement>(null)
    const baseRef = React.useRef<HTMLSpanElement>(null)
    const [needleY, setNeedleY] = React.useState<number | null>(null)
    const [padTop, setPadTop] = React.useState<number | null>(null)

    // Absolute (working baseline — pending clarification): the RULE fades IN at the
    // top only near the scroll start and OUT at the bottom only near the end; solid
    // through the middle. Scroll-gated so it isn't a fixed edge fade shown mid-scroll.
    // Ticks stay fully solid.
    const EDGE_ZONE = 0.18
    const lineMaskMV = useTransform(scrollYProgress, (p) =>
        sticky
            ? "none"
            : buildMask(
                  gradientSize * Math.max(0, 1 - p / EDGE_ZONE),
                  gradientSize * Math.max(0, (p - (1 - EDGE_ZONE)) / EDGE_ZONE)
              )
    )
    const lineMask = sticky ? rulerMask : lineMaskMV
    const clipMask = sticky ? rulerMask : "none"

    React.useEffect(() => {
        const measure = () => {
            const r = row1Ref.current
            if (!r || typeof window === "undefined") return
            // Needle sits needlePos% down the viewport; pad the top so Row 1's last-
            // line BASELINE lands there — not the box bottom, whose descender + the
            // caption gap made the needle float between the sentence and its label.
            const target = (window.innerHeight * needlePos) / 100
            const b = baseRef.current
            const bOff = b
                ? b.getBoundingClientRect().top - r.getBoundingClientRect().top
                : r.offsetHeight
            setPadTop(Math.max(0, target - bOff))
            setNeedleY(target)
        }
        measure()
        const ro = new ResizeObserver(measure)
        if (stageRef.current) ro.observe(stageRef.current)
        if (row1Ref.current) ro.observe(row1Ref.current)
        window.addEventListener("resize", measure)
        document.fonts.ready.then(measure)
        return () => {
            ro.disconnect()
            window.removeEventListener("resize", measure)
        }
    }, [text, fixedSize, textWidth, needlePos])

    const rowText: React.CSSProperties = {
        margin: 0,
        // FIXED width (not %): the sentences wrap identically at every browser
        // width, so Row 1's measured baseline stays put and the ramp never runs
        // off the right edge. On narrow screens it overflows (falls off window).
        width: textWidth,
        textAlign: "left",
        lineHeight: 1.05,
        fontFamily: `"${VER.family}", sans-serif`,
        color,
        WebkitFontSmoothing: "antialiased",
    }

    const caption: React.CSSProperties = {
        margin: "12px 0 0",
        fontFamily: `"${VER.family}", sans-serif`,
        fontSize: 12,
        fontWeight: 700,
        fontVariationSettings: "'wght' 700, 'GEOM' 100",
        // Tabular figures so the live readouts don't jitter as digits change width.
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color,
    }

    // Live readout numbers: the project orange, dimmed.
    const readout: React.CSSProperties = { color: ACCENT, opacity: 0.6 }

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100%",
                height: `${scrollLength}vh`,
                backgroundColor,
            }}
        >
            <style dangerouslySetInnerHTML={{ __html: buildFontFaceCSS(VER) }} />

            <div
                ref={stageRef}
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    paddingTop: padTop != null ? padTop : `${topOffset}vh`,
                    paddingLeft: textInset,
                    gap: "8vh",
                    // visible so the sentences can overflow (mobile, large ramp)
                    // without being clipped mid-letter; the tape is clipped on its own.
                    overflow: "visible",
                }}
            >
                {/* Ruler = axis line + scale tape. The line always fades at its top &
                    bottom ends; the ticks fade too only in Sticky mode. Needle is
                    outside → never masked. */}
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        // Mobile labels read rightward past the column, so widen to let
                        // them bleed; desktop labels sit in the margin (textInset wide).
                        width: isMobile ? "100%" : textInset,
                        height: "100%",
                    }}
                >
                    {/* Faint full-height axis = the RULE. Sticky fades its ends at the
                        screen edges; Absolute fades it at the scale's OWN ends
                        (scroll-driven) — solid through the middle. */}
                    <motion.div
                        style={{
                            position: "absolute",
                            left: sidePad,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            background: color,
                            opacity: 0.18,
                            WebkitMaskImage: lineMask,
                            maskImage: lineMask,
                        }}
                    />

                    {/* Tape clip. Sticky → ticks fade at the screen edges. Absolute →
                        ticks stay fully solid (only the rule fades, at its ends). */}
                    <motion.div
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            height: "100%",
                            width: isMobile ? "100%" : textInset,
                            overflow: "hidden",
                            WebkitMaskImage: clipMask,
                            maskImage: clipMask,
                        }}
                    >
                        {/* Type-scale tape — scrolls up past the fixed needle */}
                        <motion.div
                            style={{
                                position: "absolute",
                                left: sidePad,
                                top: needleY ?? "50%",
                                y: scaleY,
                            }}
                        >
                            {TYPE_SCALE.map((s, i) => (
                                <TapeMark
                                    key={s.name}
                                    s={s}
                                    i={i}
                                    tickGap={tickGap}
                                    mobile={isMobile}
                                    color={color}
                                    needleIndex={needleIndex}
                                />
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Fixed needle — the measurement line the tape scrolls past */}
                <div
                    style={{
                        position: "absolute",
                        left: sidePad - 16,
                        top: needleY ?? "50%",
                        width: 36,
                        height: 2,
                        background: color,
                        transform: "translateY(-50%)",
                    }}
                />

                {/* Row 1 — fixed size, shape morphs only */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                    }}
                >
                    <motion.p
                        ref={row1Ref}
                        style={{
                            ...rowText,
                            // Row 1 Size is in POINTS (to match the ruler + PT readout);
                            // pt → px is ÷0.75, so 45pt renders the same as Row 2 at 45pt.
                            fontSize: fixedSize / 0.75,
                            fontOpticalSizing: "none", // explicit opsz below; WebKit drops opsz = default and auto-sizes over it
                            fontVariationSettings: fvs,
                        }}
                    >
                        {displayText}
                        <span
                            ref={baseRef}
                            style={{
                                display: "inline-block",
                                width: 0,
                                height: 0,
                                verticalAlign: "baseline",
                            }}
                        />
                    </motion.p>
                    <p style={caption}>
                        OPSZ <motion.span style={readout}>{opszLabel}</motion.span>{" "}
                        {withItalicTail(label1)}
                    </p>
                </div>

                {/* Row 2 — true optical ramp, size + shape */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                    }}
                >
                    <motion.p
                        style={{
                            ...rowText,
                            fontSize: rampSize,
                            fontOpticalSizing: "none", // explicit opsz below; WebKit drops opsz = default and auto-sizes over it
                            fontVariationSettings: fvs,
                        }}
                    >
                        {displayText}
                    </motion.p>
                    <p style={caption}>
                        <motion.span style={readout}>{ptLabel}</motion.span>PT{" "}
                        {withItalicTail(label2)}
                    </p>
                </div>

                {debug && (
                    <div style={badgeStyle}>
                        <div style={{ fontWeight: 700 }}>Version report</div>
                        <div>
                            binary: {probe}
                        </div>
                        <div>face loaded: {loaded ? "✓" : "✗"}</div>
                        <div>raw text: {JSON.stringify(text)}</div>
                        <div>
                            nbsp out:{" "}
                            {displayText.includes("\u00A0") ? "YES" : "NO"}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

OpticalSizeDemo.defaultProps = {
    text: "Scheduling infrastructure for absolutely everyone",
    scrollLength: 400,
    tickGap: 120,
    desktopPadding: 96,
    mobilePadding: 84,
    breakpoint: 768,
    textGap: 32,
    textWidth: 560,
    topOffset: 16,
    needlePos: 45,
    fixedSize: 44,
    label1: "fixed size · size variations highlight",
    label2: "use · automatic optical sizing feature",
    color: "#242424",
    backgroundColor: "#FFFFFF",
    gradientSize: 120,
    gradientMode: "sticky",
    debug: false,
}

addPropertyControls(OpticalSizeDemo, {
    text: { type: ControlType.String, title: "Text" },
    scrollLength: {
        type: ControlType.Number,
        title: "Scroll Len",
        min: 150,
        max: 1000,
        unit: "vh",
    },
    tickGap: {
        type: ControlType.Number,
        title: "Tick Gap",
        min: 40,
        max: 320,
        unit: "px",
    },
    desktopPadding: {
        type: ControlType.Number,
        title: "Desktop Pad",
        min: 0,
        max: 320,
        unit: "px",
    },
    mobilePadding: {
        type: ControlType.Number,
        title: "Mobile Pad",
        min: 0,
        max: 160,
        unit: "px",
    },
    breakpoint: {
        type: ControlType.Number,
        title: "Breakpoint",
        min: 320,
        max: 1280,
        unit: "px",
    },
    textGap: {
        type: ControlType.Number,
        title: "Text Gap",
        min: 0,
        max: 240,
        unit: "px",
    },
    textWidth: {
        type: ControlType.Number,
        title: "Text Width",
        min: 200,
        max: 1200,
        unit: "px",
    },
    topOffset: {
        type: ControlType.Number,
        title: "Top Offset",
        min: 0,
        max: 50,
        unit: "vh",
    },
    needlePos: {
        type: ControlType.Number,
        title: "Needle Pos",
        min: 20,
        max: 80,
        unit: "%",
    },
    fixedSize: {
        type: ControlType.Number,
        title: "Row 1 Size",
        min: 12,
        max: 90,
        unit: "pt",
    },
    label1: { type: ControlType.String, title: "Caption 1" },
    label2: { type: ControlType.String, title: "Caption 2" },
    color: { type: ControlType.Color, title: "Color" },
    backgroundColor: { type: ControlType.Color, title: "BG" },
    gradientSize: {
        type: ControlType.Number,
        title: "Fade Size",
        min: 0,
        max: 400,
        unit: "px",
    },
    gradientMode: {
        type: ControlType.Enum,
        title: "Fade Mode",
        options: ["sticky", "absolute"],
        optionTitles: ["Sticky", "Absolute"],
        defaultValue: "sticky",
        displaySegmentedControl: true,
    },
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
