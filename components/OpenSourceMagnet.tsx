import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, Reorder, useInView } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import {
    calFont,
    FONT_CONTROLS,
    buildFontFaceCSS,
    readFontRevision,
    WEIGHTS,
} from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"

// Font units at 2000 UPM, measured from Cal Sans 2.007 at wght 700 / GEOM 25 / opsz 45
// (side bearings from the glyph bounds, kerning from the font's GPOS pairs).
const UPM = 2000

const METRICS = {
    O: { lsb: 52, rsb: 52 },
    p: { lsb: 80, rsb: 40 },
    e: { lsb: 40, rsb: 32 },
    n: { lsb: 80, rsb: 72 },
    S: { lsb: 20, rsb: 46 },
    o: { lsb: 40, rsb: 40 },
    u: { lsb: 72, rsb: 80 },
    c: { lsb: 42, rsb: 33 },
    r: { lsb: 82, rsb: 20 },
    " ": { width: 334, lsb: 0, rsb: 0 },
}

const KERNING = {
    Op: 0,
    Oe: -20,
    OS: -40,
    Oo: -20,
    Oc: -20,
    pO: -20,
    pe: -10,
    pS: -40,
    po: -10,
    pc: -10,
    eS: -40,
    SO: -10,
    Se: -10,
    SS: -20,
    So: -10,
    Sc: -10,
    oO: -20,
    oe: -10,
    oS: -40,
    oo: -10,
    oc: -10,
    re: -50,
    rS: -20,
    ro: -50,
    rc: -50,
    cO: -30,
    ce: -30,
    cn: -40,
    cS: -20,
    co: -30,
    cu: -10,
    cr: -40,
    cc: -30,
}

// THE STICKER DATA
const STICKER_DATA = [
    { id: 100, text: "Drag me!", top: "0%", left: "9%", zIndex: 20 },
    { id: 101, text: "Remix me!", top: "10%", left: "90%", zIndex: 20 },
    { id: 102, text: "Branch me!", top: "70%", left: "40%", zIndex: 0 },
]

export default function OpenSourceMagnet(props) {
    const {
        defaultContent,
        weight,
        geom, // --- Swapped "mode" to "geom" ---
        opsz,
        debug,
        refreshColor,
        fontSize: mainFontSize,
        cycleSpeed,
        refreshOffset,
        stickerColor,
        stickerScale,
    } = props

    const ver = calFont(props)

    // Version-debug probe (badge): reads the build from the rendered binary.
    const [probe, setProbe] = useState("…")
    const [faceLoaded, setFaceLoaded] = useState(false)
    useEffect(() => {
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
        }
    }, [ver.family, debug])

    const toPx = (units) => (units / UPM) * mainFontSize
    const [items, setItems] = useState([])
    const [stickers, setStickers] = useState([])

    // --- 1. SCROLL DETECTION ---
    const containerRef = useRef(null)
    const isInView = useInView(containerRef, { once: true, amount: 0.3 })

    // --- 2. THE STAGGERED TIMER ---
    const [visibleCount, setVisibleCount] = useState(0)

    useEffect(() => {
        if (!isInView) return

        const timeouts = STICKER_DATA.map((_, index) => {
            return setTimeout(
                () => {
                    setVisibleCount((prev) => prev + 1)
                },
                800 + index * 1000
            )
        })

        return () => timeouts.forEach(clearTimeout)
    }, [isInView])

    // --- 3. INIT STICKERS & LETTERS ---
    useEffect(() => {
        setStickers(
            STICKER_DATA.map((s) => ({
                ...s,
                rotate: Math.random() * 40 - 20,
            }))
        )
    }, [])

    useEffect(() => {
        const paddedContent = `  ${defaultContent}  `
        setItems(
            paddedContent.split("").map((char, i) => ({
                id: `magnet-${char}-${i}`,
                char,
            }))
        )
    }, [defaultContent])

    const isDirty =
        items.map((item) => item.char).join("") !== `  ${defaultContent}  `

    const handleReset = () => {
        const paddedContent = `  ${defaultContent}  `
        setItems(
            paddedContent.split("").map((char, i) => ({
                id: `magnet-${char}-${i}`,
                char,
            }))
        )
    }

    const scaleMultiplier = stickerScale / 100
    const stickerFontSize = Math.max(12, mainFontSize * 0.35 * scaleMultiplier)

    return (
        <div ref={containerRef} style={containerStyle}>
            <style
                dangerouslySetInnerHTML={{ __html: buildFontFaceCSS(ver) }}
            />

            {/* --- STICKERS --- */}
            {stickers.map((s, index) => {
                const isVisible = index < visibleCount

                return (
                    <motion.div
                        key={s.id}
                        drag
                        dragSnapToOrigin={false}
                        initial={{ opacity: 0, scale: 0, rotate: s.rotate }}
                        animate={{
                            opacity: isVisible ? 1 : 0,
                            scale: isVisible ? 1 : 0,
                            rotate: s.rotate,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                        whileHover={{
                            scale: 1.1,
                            rotate: s.rotate + 2,
                            cursor: "grab",
                            transition: { duration: 0.1 },
                        }}
                        whileTap={{ scale: 0.95, cursor: "grabbing" }}
                        whileDrag={{ scale: 1.2, zIndex: 999 }}
                        style={{
                            position: "absolute",
                            left: s.left,
                            top: s.top,
                            x: "-50%",
                            y: "-50%",
                            zIndex: s.zIndex,
                            backgroundColor: stickerColor,
                            color: "white",
                            padding: "0.4em 1em",
                            borderRadius: "12px",
                            fontSize: `${stickerFontSize}px`,
                            fontWeight: 700,
                            fontFamily: `"${ver.family}", sans-serif`,
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                            transformOrigin: "center center",
                            boxShadow: `0 8px 24px ${stickerColor}40`,
                            pointerEvents: isVisible ? "auto" : "none",
                        }}
                    >
                        {s.text}
                    </motion.div>
                )
            })}

            {/* --- LETTERS --- */}
            <Reorder.Group
                axis="x"
                values={items}
                onReorder={setItems}
                style={groupStyle}
            >
                {items.map((item, i) => {
                    const m = METRICS[item.char] || { lsb: 40, rsb: 40 }
                    const prevChar = items[i - 1]?.char
                    const kern = prevChar
                        ? toPx(KERNING[prevChar + item.char] || 0)
                        : 0
                    const isSpace = item.char === " "

                    return (
                        <Reorder.Item
                            key={item.id}
                            value={item}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                cursor: "grab",
                                height: `${mainFontSize}px`,
                                width: isSpace ? toPx(m.width) : "auto",
                                marginLeft: isSpace
                                    ? 0
                                    : kern - toPx(m.lsb / 1.5),
                                marginRight: isSpace ? 0 : -toPx(m.rsb / 1.5),
                                zIndex: 10,
                            }}
                        >
                            <motion.div
                                whileHover={{
                                    scale: isSpace ? 1 : 1.25,
                                    rotate: isSpace ? 0 : [0, -1.2, 1.2, 0],
                                    transition: {
                                        rotate: {
                                            repeat: Infinity,
                                            duration: cycleSpeed,
                                        },
                                        scale: { duration: 0.2 },
                                    },
                                }}
                                whileDrag={{ scale: 1.35, zIndex: 999 }}
                                style={{
                                    fontFamily: `"${ver.family}", sans-serif`,
                                    fontSize: `${mainFontSize}px`,
                                    fontOpticalSizing: "none", // explicit opsz below; WebKit drops opsz = default and auto-sizes over it
                                    fontVariationSettings: `"wght" ${weight}, "GEOM" ${geom}, "opsz" ${opsz}`,
                                    lineHeight: 1,
                                    pointerEvents: "none",
                                    padding: isSpace
                                        ? 0
                                        : `0 ${toPx(m.lsb / 4)}px`,
                                }}
                            >
                                {item.char}
                            </motion.div>
                        </Reorder.Item>
                    )
                })}
            </Reorder.Group>

            {/* --- RESET BUTTON --- */}
            <div
                style={{
                    ...resetWrapperStyle,
                    marginTop: `${refreshOffset}px`,
                }}
            >
                <motion.div
                    onClick={handleReset}
                    animate={{
                        opacity: isDirty ? 1 : 0,
                        scale: isDirty ? 1 : 0.8,
                    }}
                    style={{ cursor: "pointer", zIndex: 20 }}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 16 16"
                        fill={refreshColor}
                    >
                        <path d="M13.5 8c0-3.034-2.474-5.5-5.535-5.5a5.53 5.53 0 0 0-5.328 4H6V8H.75A.75.75 0 0 1 0 7.25V2h1.5v3.233A7.04 7.04 0 0 1 7.965 1C11.846 1 15 4.13 15 8s-3.154 7-7.035 7a7.04 7.04 0 0 1-5.695-2.888l-.442-.605 1.211-.885.443.605A5.54 5.54 0 0 0 7.965 13.5c3.06 0 5.535-2.466 5.535-5.5" />
                    </svg>
                </motion.div>
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

const containerStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
}
const groupStyle = {
    display: "flex",
    alignItems: "center",
    listStyle: "none",
    padding: 0,
    margin: 0,
    zIndex: 10,
}
const resetWrapperStyle = {
    height: "32px",
    display: "flex",
    alignItems: "center",
}
const versionBadgeStyle = {
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

addPropertyControls(OpenSourceMagnet, {
    ...FONT_CONTROLS,
    defaultContent: {
        type: ControlType.String,
        title: "Text",
        defaultValue: "Open Source",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Point Size",
        min: 20,
        max: 300,
        defaultValue: 120,
    },
    weight: {
        type: ControlType.Enum,
        title: "Style",
        options: WEIGHTS.map((w) => w.value),
        optionTitles: WEIGHTS.map((w) => w.name),
        defaultValue: 700,
    },
    /* --- The new 0-100 GEOM Control --- */
    geom: {
        type: ControlType.Number,
        title: "Geo Axis",
        min: 0,
        max: 100,
        step: 1, // Switched step to whole numbers
        defaultValue: 25,
    },
    opsz: {
        type: ControlType.Number,
        title: "Optical Size",
        min: 8,
        max: 45,
        step: 1,
        defaultValue: 36,
    },
    cycleSpeed: {
        type: ControlType.Number,
        title: "Jiggle Speed",
        min: 0.05,
        max: 1,
        step: 0.01,
        defaultValue: 0.12,
    },
    refreshColor: {
        type: ControlType.Color,
        title: "Reset Color",
        defaultValue: "#000",
    },
    refreshOffset: {
        type: ControlType.Number,
        title: "Refresh Spacing",
        min: -20,
        max: 80,
        defaultValue: 20,
    },
    stickerColor: {
        type: ControlType.Color,
        title: "Sticker Color",
        defaultValue: "#7C00F6",
    },
    stickerScale: {
        type: ControlType.Number,
        title: "Sticker Size %",
        min: 10,
        max: 200,
        defaultValue: 50,
    },
    debug: {
        type: ControlType.Boolean,
        title: "Debug Badge",
        defaultValue: false,
    },
})
