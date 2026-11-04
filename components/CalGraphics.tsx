import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

// Font-version machinery lives in Shared.tsx (Phase 2). Re-Copy-Import after any
// Shared edit — the @<hash> in the URL is a version pin.
import {
    CAL_SANS,
    buildFontFaceCSS,
    readFontRevision,
} from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"

// --- 4-STEP GEOM CYCLE (A11y 0 / UI 25 / Base 50 / Geo 100) ---
const STEPS = [
    { geom: 0, label: "0–A11y", color: "#ff6b35" },
    { geom: 25, label: "25–UI", color: "#242424" },
    { geom: 50, label: "50–Base", color: "#009efc" },
    { geom: 100, label: "100–Geo", color: "#02c30e" },
]
const NSTEPS = STEPS.length

// Color palette.
const BLACK = "#242424"
const ORANGE = "#ff6b35"
const BLUE = "#009efc"
const GREEN = "#02c30e"

// Morphing letters in "Cal Graphics" (by index) — ORIGINAL front/side 2-face cube.
// front = the default glyph (black); side = the special form. `rotY[step]` toggles which
// shows (0 = front, -90 = side) and the cube pivots with negative depth, so the OLD glyph
// turns away as the new one turns in. The side carries the per-step feature + color.
// `a` has THREE forms (ss14 / default / ss01) so its side feature varies by step; its
// Geo→A11y wrap is the one transition that swaps without a turn (side→side).
const MORPH = {
    0: { ch: "C", formId: ["d", "d", "d", "ss10"], feat: ["normal", "normal", "normal", '"ss10" 1'], color: [BLACK, BLACK, BLACK, GREEN] }, // default -> Futura C (green) at Geo
    1: { ch: "a", formId: ["ss14", "d", "ss01", "ss01"], feat: ['"ss14" 1', "normal", '"ss01" 1', '"ss01" 1'], color: [ORANGE, BLACK, BLUE, BLACK] }, // ss14 -> default -> ss01 (blue->black); every change flips, incl wrap back to ss14
    2: { ch: "l", formId: ["ss14", "d", "d", "d"], feat: ['"ss14" 1', "normal", "normal", "normal"], color: [ORANGE, BLACK, BLACK, BLACK] }, // ss14 l -> default l
    4: { ch: "G", formId: ["d", "d", "ss05", "ss05"], feat: ["normal", "normal", '"ss05" 1', '"ss05" 1'], color: [BLACK, BLACK, BLUE, BLACK] }, // Humanist -> Geometric ss05 (blue->black @Geo)
    6: { ch: "a", formId: ["ss14", "d", "ss01", "ss01"], feat: ['"ss14" 1', "normal", '"ss01" 1', '"ss01" 1'], color: [ORANGE, BLACK, BLUE, BLACK] },
    10: { ch: "c", formId: ["d", "d", "d", "ss10"], feat: ["normal", "normal", "normal", '"ss10" 1'], color: [BLACK, BLACK, BLACK, GREEN] }, // default -> Futura c (green) at Geo
}

// Badge pill widths per step (em, in the 0.38em badge context) — cosmetic; tune visually.
const BADGE_W = [4, 4, 4.7, 4.9]

export default function CalGraphicsPerfected(props) {
    const { fontSize, badgeOnTop, debug } = props

    const ver = CAL_SANS

    // Continuous tick for the rolling badge
    const [tick, setTick] = useState(0)
    const [loaded, setLoaded] = useState(false)
    const text = "Cal Graphics"

    // Version badge state — what the loaded BINARY actually reports.
    const [probe, setProbe] = useState("…")
    const [faceLoaded, setFaceLoaded] = useState(false)

    // Runtime-measured letter widths: { charIndex: [emWidth per step] }.
    const measureRef = useRef<HTMLDivElement>(null)
    const [widths, setWidths] = useState<Record<number, number[]>>({})

    useEffect(() => {
        document.fonts.ready.then(() => setLoaded(true))
        const interval = setInterval(() => setTick((t) => t + 1), 2000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        let alive = true
        setProbe("probing…")
        readFontRevision(ver.url).then((r) => alive && setProbe(r))
        const face = `700 24px "${ver.family}"`
        const check = () => alive && setFaceLoaded(document.fonts.check(face))
        check()
        document.fonts.ready.then(check)
        return () => {
            alive = false
        }
    }, [ver.family, ver.url])

    // Measure each morphing letter at every GEOM step from the hidden layer.
    // Re-runs when the font or size (→ auto-opsz) changes. DOM widths honor GEOM.
    useEffect(() => {
        if (!loaded || !measureRef.current) return
        const fsPx =
            parseFloat(getComputedStyle(measureRef.current).fontSize) || 1
        const next: Record<number, number[]> = {}
        measureRef.current.querySelectorAll("[data-idx]").forEach((el) => {
            const idx = Number(el.getAttribute("data-idx"))
            const stp = Number(el.getAttribute("data-step"))
            if (!next[idx]) next[idx] = []
            next[idx][stp] = (el as HTMLElement).getBoundingClientRect().width / fsPx
        })
        setWidths(next)
    }, [loaded, ver.family, fontSize])

    const step = tick % NSTEPS
    // -720/cycle (not -360) = an extra full FLOURISH turn on the Geo(100)→A11y(0) wrap.
    const badgeRotationY = Math.floor(tick / NSTEPS) * -720 - step * 90

    const badgeDepthNum = BADGE_W[step] / 2
    const badgeDepth = badgeDepthNum + "em"
    const negBadgeDepth = -badgeDepthNum + "em"

    return (
        <div
            style={{
                ...containerStyle,
                fontSize,
                fontFamily: `"${ver.family}", sans-serif`,
                position: "relative",
                opacity: loaded ? 1 : 0,
                flexDirection: badgeOnTop ? "column" : "row",
            }}
        >
            <style>{buildFontFaceCSS(ver, "block")}</style>

            {/* --- BADGE --- */}
            <motion.div
                animate={{ width: BADGE_W[step] + "em" }}
                transition={spring}
                style={{
                    ...badgeContainer,
                    marginRight: badgeOnTop ? "0em" : "0.8em",
                    marginBottom: badgeOnTop ? "0.4em" : "0em",
                }}
            >
                <motion.div
                    animate={{
                        rotateY: badgeRotationY,
                        z: negBadgeDepth,
                    }}
                    transition={spring}
                    style={badgeCube}
                >
                    {STEPS.map((s, idx) => (
                        <motion.div
                            key={idx}
                            animate={{
                                transform: `rotateY(${idx * 90}deg) translateZ(${badgeDepth})`,
                            }}
                            transition={spring}
                            style={{ ...badgeFace, backgroundColor: s.color }}
                        >
                            <span>GEOM:</span>
                            <span>{s.label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* --- WORD CONTAINER (letters held at GEOM 25 / UI default) --- */}
            <div
                style={{
                    ...wordStyle,
                    fontVariationSettings: '"wght" 700, "GEOM" 25',
                }}
            >
                {text.split("").map((char, i) => {
                    const m = MORPH[i]

                    // Static char \u2014 inherits the animated GEOM from the word container.
                    if (!m) {
                        return (
                            <span key={i} style={{ display: "inline-block" }}>
                                {char === " " ? "\u00A0" : char}
                            </span>
                        )
                    }

                    const w = widths[i]?.[step] ?? 0.5
                    const charDepth = w / 2 + "em"
                    const negCharDepth = -(w / 2) + "em"

                    // 2 faces; a 180 flip on EVERY glyph change, accumulating one direction.
                    // The hidden face re-renders to the next glyph. `switchCount` counts
                    // switches; parity picks the front face. Only a HELD color fades.
                    const sw = [0, 1, 2, 3].map((k) =>
                        m.formId[k] !== m.formId[(k + 3) % 4] ? 1 : 0
                    )
                    const rem = tick % NSTEPS
                    let switchCount = Math.floor(tick / NSTEPS) * (sw[0] + sw[1] + sw[2] + sw[3])
                    for (let t = 1; t <= rem; t++) switchCount += sw[t]

                    // step of the previous distinct form (the glyph that turns away)
                    let pStep = step
                    for (let n = 0; n < NSTEPS; n++) {
                        pStep = (pStep + NSTEPS - 1) % NSTEPS
                        if (m.formId[pStep] !== m.formId[step]) break
                    }

                    const switchedNow = sw[step] === 1
                    const even = switchCount % 2 === 0
                    const rotY = -180 * switchCount
                    const frontFeat = even ? m.feat[step] : m.feat[pStep]
                    const frontColor = even ? m.color[step] : m.color[pStep]
                    const sideFeat = even ? m.feat[pStep] : m.feat[step]
                    const sideColor = even ? m.color[pStep] : m.color[step]
                    // Each face renders at ITS step's GEOM axis value — so the A11y
                    // step (0) is truly GEOM 0, not GEOM 25 faked with an ss feature.
                    const frontGeom = STEPS[even ? step : pStep].geom
                    const sideGeom = STEPS[even ? pStep : step].geom
                    const frontFade = even && !switchedNow ? 1 : 0
                    const sideFade = !even && !switchedNow ? 1 : 0


                    return (
                        <motion.span
                            key={i}
                            animate={{ width: w + "em" }}
                            transition={spring}
                            style={charContainer}
                        >
                            <motion.span
                                animate={{ rotateY: rotY, z: negCharDepth }}
                                transition={spring}
                                style={charCube}
                            >
                                {/* Face at 0deg */}
                                <motion.span
                                    animate={{
                                        transform: `rotateY(0deg) translateZ(${charDepth})`,
                                        color: frontColor,
                                    }}
                                    transition={{
                                        ...spring,
                                        color: { duration: frontFade },
                                    }}
                                    style={{
                                        ...charFace,
                                        fontVariationSettings: `"wght" 700, "GEOM" ${frontGeom}`,
                                        fontFeatureSettings: frontFeat,
                                    }}
                                >
                                    {char}
                                </motion.span>
                                {/* Face at 90deg */}
                                <motion.span
                                    animate={{
                                        transform: `rotateY(180deg) translateZ(${charDepth})`,
                                        color: sideColor,
                                    }}
                                    transition={{
                                        ...spring,
                                        color: { duration: sideFade },
                                    }}
                                    style={{
                                        ...charFace,
                                        fontVariationSettings: `"wght" 700, "GEOM" ${sideGeom}`,
                                        fontFeatureSettings: sideFeat,
                                    }}
                                >
                                    {char}
                                </motion.span>
                            </motion.span>
                        </motion.span>
                    )
                })}
            </div>

            {/* Hidden measuring layer \u2014 DOM honors font-variation-settings (canvas can't) */}
            <div ref={measureRef} aria-hidden="true" style={measureLayerStyle}>
                {Object.entries(MORPH).map(([idx, m]) =>
                    STEPS.map((s, stp) => (
                        <span
                            key={`${idx}-${stp}`}
                            data-idx={idx}
                            data-step={stp}
                            style={{
                                display: "inline-block",
                                fontVariationSettings: `"wght" 700, "GEOM" ${s.geom}`,
                                fontFeatureSettings:
                                    m.feat[stp],
                            }}
                        >
                            {m.ch}
                        </span>
                    ))
                )}
            </div>

            {debug && (
                <div style={versionBadgeStyle}>
                    <div style={{ fontWeight: 700 }}>Version report</div>
                    <div>
                        binary: {probe}
                    </div>
                    <div>face loaded: {faceLoaded ? "✓" : "✗"}</div>
                </div>
            )}
        </div>
    )
}

// --- STYLES & PHYSICS ---

const spring = { type: "spring", stiffness: 180, damping: 22, mass: 1 }

const measureLayerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    height: 0,
    overflow: "hidden",
    visibility: "hidden",
    pointerEvents: "none",
    whiteSpace: "nowrap",
}

const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    fontFamily: `"${CAL_SANS.family}", sans-serif`,
    fontWeight: 700,
    color: "#242424",
    letterSpacing: 0,
    fontVariationSettings: '"wght" 700, "GEOM" 25',
}

const badgeContainer: React.CSSProperties = {
    position: "relative",
    height: "2.4em",
    perspective: 1200,
    fontSize: "0.38em",
}

const badgeCube: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transformStyle: "preserve-3d",
}

const badgeFace: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "0.5em 0.3em",
    boxSizing: "border-box",
    lineHeight: 0.95,
    color: "white",
    borderRadius: "0.15em",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    whiteSpace: "nowrap",
}

const wordStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-end",
    height: "1em",
    lineHeight: 1,
    whiteSpace: "pre",
}

const charContainer: React.CSSProperties = {
    display: "inline-block",
    position: "relative",
    height: "1em",
    perspective: 1200,
}

const charCube: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transformStyle: "preserve-3d",
}

const charFace: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    width: "100%",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
}

addPropertyControls(CalGraphicsPerfected, {
    fontSize: {
        type: ControlType.Number,
        defaultValue: 120,
        min: 40,
        max: 300,
        title: "Font Size",
    },
    badgeOnTop: {
        type: ControlType.Boolean,
        defaultValue: false,
        title: "Badge on Top",
    },
    debug: { type: ControlType.Boolean, title: "Debug Badge", defaultValue: false },
})

const versionBadgeStyle: React.CSSProperties = {
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
