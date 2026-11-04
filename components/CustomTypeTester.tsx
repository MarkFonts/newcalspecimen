import React, { useState, useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useAnimation } from "framer-motion"
// Frozen font machinery + axis/preset constants from Shared.tsx. Tester-specific UI
// stays inline here (fast iteration); extract to SharedTester.tsx once it stabilizes.
import {
    calFont,
    FONT_CONTROLS,
    buildFontFaceCSS,
    readFontRevision,
    AXIS_RANGES,
    ytasCss,
    GEOM_PRESET_LIST,
} from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"
// Shared radii (match the specimen card / glyph picker toggles). Re-Copy-Import from
// SharedTester's ••• menu if that file's @hash changes.
import {
    RADIUS_PILL,
    RADIUS_BTN,
} from "https://framer.com/m/SharedTester-SB64gG.js@Dd5hSuq9KXwyNAlMQCX7"

interface Props {
    font?: string
    cossRoman?: string
    cossItalic?: string
    defaultContent: string
    defaultWeight: number
    defaultSize: number
    defaultSpacing: number
    refreshColor: string
    refreshSize: number
    gapX: number
    offsetY: number
    rowPaddingTop: number
    previewHeight: number
    debug: boolean
}

// A labeled control that shows a segmented preset toggle and "unlocks" (via the
// right-side handle) into a draggable slider over [min, max]. Private to this tester;
// used by both Geometry and Italic. `extra` is an optional slot (the reset button).
function MorphControl({
    label,
    value,
    setValue,
    presets,
    min,
    max,
    format,
    styles,
    rowWidth,
    handleSize,
    extra,
}: {
    label: string
    value: number
    setValue: (v: number) => void
    presets: { name: string; value: number }[]
    min: number
    max: number
    format: (v: number) => string
    styles: any
    rowWidth: number
    handleSize: number
    extra?: React.ReactNode
}) {
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const trackRef = useRef<HTMLDivElement>(null)
    const dragRange = rowWidth - handleSize
    const span = max - min

    return (
        <div style={{ ...styles.controlRow, position: "relative" }}>
            <div style={styles.header}>
                <span style={styles.label}>{label}</span>
                <motion.span
                    animate={{ opacity: isUnlocked ? 1 : 0 }}
                    style={styles.value}
                >
                    {format(value)}
                </motion.span>
            </div>

            <div style={styles.controlArea} ref={trackRef}>
                <motion.div
                    animate={{
                        opacity: isUnlocked ? 0 : 1,
                        pointerEvents: isUnlocked ? "none" : "auto",
                    }}
                    style={{ ...styles.modeToggle, zIndex: 1 }}
                >
                    {presets.map((p) => (
                        <button
                            key={p.name}
                            style={styles.modeBtn(value === p.value)}
                            onClick={() => setValue(p.value)}
                        >
                            {p.name}
                        </button>
                    ))}
                </motion.div>

                <motion.div
                    animate={{
                        width: isUnlocked ? "100%" : 0,
                        opacity: isUnlocked ? 1 : 0,
                        x: isUnlocked ? 0 : rowWidth + 12,
                    }}
                    style={{
                        height: 2,
                        background: "#F1F1F1",
                        position: "absolute",
                        borderRadius: 1,
                    }}
                />

                <motion.div
                    drag={isUnlocked ? "x" : false}
                    dragConstraints={{ left: 0, right: dragRange }}
                    dragElastic={0}
                    dragMomentum={false}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                    onDrag={(e, info) => {
                        if (trackRef.current) {
                            const rect =
                                trackRef.current.getBoundingClientRect()
                            const localX =
                                info.point.x - rect.left - handleSize / 2
                            const pct = localX / dragRange
                            setValue(
                                Math.max(min, Math.min(max, min + pct * span))
                            )
                        }
                    }}
                    onClick={() => {
                        if (!isUnlocked) setIsUnlocked(true)
                    }}
                    animate={{
                        x: isUnlocked
                            ? ((value - min) / span) * dragRange
                            : rowWidth + 12,
                        width: isUnlocked ? 20 : 6,
                        height: isUnlocked ? 20 : 16,
                        borderRadius: isUnlocked ? 10 : 3,
                        backgroundColor: isUnlocked ? "#242424" : "#8E8E8E",
                    }}
                    transition={
                        isDragging
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 350, damping: 30 }
                    }
                    style={{
                        left: 0,
                        position: "absolute",
                        cursor: "pointer",
                        zIndex: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        style={{ position: "absolute", overflow: "visible" }}
                    >
                        <motion.path
                            // Start at the target: with no initial d, the first render
                            // writes d="undefined" and Chrome logs a path parse error.
                            initial={false}
                            animate={{
                                d: isUnlocked
                                    ? "M16 16 L16 16"
                                    : "M7 16 L11.5 16",
                                opacity: isUnlocked ? 0 : 1,
                            }}
                            stroke="#8E8E8E"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <motion.path
                            // Start at the target: with no initial d, the first render
                            // writes d="undefined" and Chrome logs a path parse error.
                            initial={false}
                            animate={{
                                d: isUnlocked
                                    ? "M16 16 L16 16"
                                    : "M20.5 16 L25 16",
                                opacity: isUnlocked ? 0 : 1,
                            }}
                            stroke="#8E8E8E"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </motion.div>
            </div>
            {extra}
        </div>
    )
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

export default function CustomTypeTester(props: Props) {
    const {
        defaultContent = "Type away...",
        defaultWeight = 400,
        defaultSize = 100,
        defaultSpacing = 0,
        refreshColor = "#666666",
        refreshSize = 16,
        gapX = 15,
        offsetY = 0,
        rowPaddingTop = 0,
        previewHeight = 140,
        debug = false,
    } = props

    const ver = calFont(props)

    const [csTtWeight, setCsTtWeight] = useState(defaultWeight)
    const [csTtSize, setCsTtSize] = useState(defaultSize)
    const [csTtSpacing, setCsTtSpacing] = useState(defaultSpacing)
    const [csTtGeom, setCsTtGeom] = useState(AXIS_RANGES.GEOM.default)
    // New v2 axes — seeded from the canonical defaults.
    const [csTtOpsz, setCsTtOpsz] = useState(AXIS_RANGES.opsz.default)
    const [csTtYtas, setCsTtYtas] = useState(AXIS_RANGES.YTAS.default)
    const [csTtShrp, setCsTtShrp] = useState(AXIS_RANGES.SHRP.default)
    const [csTtItal, setCsTtItal] = useState(AXIS_RANGES.ital.default)
    const [csTtText, setCsTtText] = useState(defaultContent)
    // Version-debug badge probe.
    const [probe, setProbe] = useState("…")
    const [faceLoaded, setFaceLoaded] = useState(false)

    // FIX: Replaced windowWidth with containerWidth
    const [containerWidth, setContainerWidth] = useState(1200)

    const controls = useAnimation()
    const containerRef = useRef<HTMLElement>(null) // FIX: Ref for the outermost section
    const csTtTextareaRef = useRef<HTMLTextAreaElement>(null)
    useIOSFocusScrollGuard(csTtTextareaRef)

    const hasChanged =
        csTtWeight !== defaultWeight ||
        csTtSize !== defaultSize ||
        csTtSpacing !== defaultSpacing ||
        csTtText !== defaultContent ||
        csTtGeom !== AXIS_RANGES.GEOM.default ||
        csTtOpsz !== AXIS_RANGES.opsz.default ||
        csTtYtas !== AXIS_RANGES.YTAS.default ||
        csTtShrp !== AXIS_RANGES.SHRP.default ||
        csTtItal !== AXIS_RANGES.ital.default

    // FIX: ResizeObserver tracks the actual component width, ignoring the window
    useEffect(() => {
        if (!containerRef.current) return
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width)
            }
        })
        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    // Size the textarea to its content so the clamp can vertically center it (the field
    // uses margin:auto). The clamp wrapper enforces the height cap + scroll, so this
    // grows the FIELD, never the module. Re-measure on font load.
    useEffect(() => {
        const ta = csTtTextareaRef.current
        if (!ta) return
        const resize = () => {
            // Resetting the height can collapse the page for a moment; don't let that move it.
            const y = window.scrollY
            ta.style.height = "auto"
            // cap at the clamp: fits → field == content (margin:auto centers it);
            // overflows → field == clamp, so the textarea itself scrolls to the caret.
            ta.style.height = `${Math.min(ta.scrollHeight, previewHeight)}px`
            if (window.scrollY !== y) window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior })
        }
        resize()
        document.fonts.ready.then(resize)
    }, [
        csTtText,
        csTtSize,
        csTtWeight,
        csTtSpacing,
        csTtGeom,
        csTtOpsz,
        csTtYtas,
        csTtShrp,
        csTtItal,
        ver.family,
        previewHeight,
    ])

    const handleReset = async () => {
        await controls.start({ rotate: 360, transition: { duration: 0.5 } })
        controls.set({ rotate: 0 })
        setCsTtWeight(defaultWeight)
        setCsTtSize(defaultSize)
        setCsTtSpacing(defaultSpacing)
        setCsTtText(defaultContent)
        setCsTtGeom(AXIS_RANGES.GEOM.default)
        setCsTtOpsz(AXIS_RANGES.opsz.default)
        setCsTtYtas(AXIS_RANGES.YTAS.default)
        setCsTtShrp(AXIS_RANGES.SHRP.default)
        setCsTtItal(AXIS_RANGES.ital.default)
    }

    useEffect(() => {
        const styleId = "cs-tt-standard-styles"
        const style = document.createElement("style")
        style.id = styleId
        style.textContent = `
            ${buildFontFaceCSS(ver)}
            .cs-tt-slider { -webkit-appearance: none; width: 100%; height: 2px; background: #F1F1F1; outline: none; margin: 0; position: relative; border-radius: 1px; }
            .cs-tt-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #242424; cursor: pointer; border: none; }
            .cs-tt-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #242424; cursor: pointer; border: none; }
        `
        document.head.appendChild(style)
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
            if (document.head.contains(style)) document.head.removeChild(style)
        }
    }, [ver.family, debug])

    // FIX: Squeeze limits adjusted for the actual module width
    const isSqueezed = containerWidth > 338 && containerWidth <= 356
    const rowWidth = isSqueezed ? 142 : 150
    const dynamicGap = isSqueezed ? "1rem" : "2.5rem"

    const handleSize = 20

    const csTtStyles = {
        container: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column" as const,
            background: "#ffffff",
            fontFamily: `"${ver.family}", sans-serif`,
            position: "relative" as const,
        },
        controlsGroup: {
            display: "grid",
            columnGap: dynamicGap,
            rowGap: "2.5rem",
            justifyContent: "center",
            padding: "16px 0 32px",
            position: "relative" as const,
            // gridTemplateColumns is set inline (responsive 4-up / 2-up). margin pins
            // the block to the bottom of the module and centers it.
            margin: "auto auto 0",
            transition: "column-gap 0.2s ease",
        },
        controlRow: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "10px",
            width: rowWidth,
            marginTop: rowPaddingTop,
            transition: "width 0.2s ease",
            flexShrink: 0,
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            height: 20,
            alignItems: "center",
        },
        controlArea: {
            height: 32,
            display: "flex",
            alignItems: "center",
            position: "relative" as const,
        },
        label: {
            fontSize: 14,
            fontWeight: 500,
            color: "#8E8E8E",
            letterSpacing: "-0.02em",
        },
        value: {
            fontSize: 14,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
            color: "#242424",
            letterSpacing: "-0.03em",
        },
        modeToggle: {
            display: "inline-flex",
            background: "#F1F1F1",
            borderRadius: RADIUS_PILL,
            padding: 4,
            gap: 2,
            width: "100%",
            boxSizing: "border-box" as const,
        },
        modeBtn: (isActive: boolean) => ({
            flex: 1,
            padding: "5px 0",
            fontSize: 14,
            fontFamily: `"${ver.family}", sans-serif`,
            fontWeight: 600,
            border: "none",
            borderRadius: RADIUS_BTN,
            background: isActive ? "#ffffff" : "transparent",
            color: isActive ? "#242424" : "#8E8E8E",
            cursor: "pointer",
            boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
        }),
        previewClamp: {
            // fixed, dial-able window so font Size never resizes the module. Centered
            // when the text fits; type more and it overflows DOWNWARD and scrolls.
            height: previewHeight,
            overflow: "hidden" as const,
            display: "flex",
            flexDirection: "column" as const,
        },
        preview: {
            width: "100%",
            // centers vertically when it fits the clamp; when content is taller, the auto
            // margins collapse so it top-anchors and the clamp scrolls the overflow under.
            margin: "auto 0",
            outline: "none",
            border: "none",
            background: "transparent",
            fontFamily: `"${ver.family}", sans-serif`,
            fontSize: csTtSize,
            fontWeight: csTtWeight,
            letterSpacing: `${csTtSpacing / 100}em`,
            lineHeight: 1.3,
            color: "#242424",
            textAlign: "center" as const,
            fontOpticalSizing: "none", // explicit opsz below; WebKit drops opsz = default and auto-sizes over it
            fontStyle: csTtItal >= 0.5 ? "italic" : "normal", // the cossui build italicises by file, not by the ital axis
            fontVariationSettings: `"wght" ${csTtWeight}, "GEOM" ${csTtGeom}, "opsz" ${csTtOpsz}, "YTAS" ${ytasCss(csTtYtas)}, "SHRP" ${csTtShrp}, "ital" ${csTtItal}`,
            resize: "none" as const,
            overflow: "auto" as const,
            display: "block",
        },
    }

    const renderSlider = (s) => (
        <div key={s.label} style={csTtStyles.controlRow}>
            <div style={csTtStyles.header}>
                <span style={csTtStyles.label}>{s.label}</span>
                <span style={csTtStyles.value}>
                    {s.val}
                    {s.unit}
                </span>
            </div>
            <div style={csTtStyles.controlArea}>
                <input
                    className="cs-tt-slider"
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step || 1}
                    value={s.val}
                    onChange={(e) => s.set(parseFloat(e.target.value))}
                />
            </div>
        </div>
    )

    // Per-control definitions, rendered in a width-dependent order + column count.
    const sliderDefs = {
        Weight: { label: "Weight", val: csTtWeight, set: setCsTtWeight, min: 400, max: 700, unit: "" },
        Optical: { label: "Optical", val: csTtOpsz, set: setCsTtOpsz, min: AXIS_RANGES.opsz.min, max: AXIS_RANGES.opsz.max, unit: "pt" },
        Size: { label: "Size", val: csTtSize, set: setCsTtSize, min: 12, max: 350, unit: "px" },
        Tracking: { label: "Tracking", val: csTtSpacing, set: setCsTtSpacing, min: -10, max: 10, unit: "%", step: 0.5 },
        Ascender: { label: "Ascender", val: csTtYtas, set: setCsTtYtas, min: AXIS_RANGES.YTAS.min, max: AXIS_RANGES.YTAS.max, unit: "" },
        Sharpness: { label: "Sharpness", val: csTtShrp, set: setCsTtShrp, min: AXIS_RANGES.SHRP.min, max: AXIS_RANGES.SHRP.max, unit: "" },
    }

    const renderControl = (key) => {
        if (key === "Italic")
            return (
                <MorphControl
                    key="Italic"
                    label="Italic"
                    value={csTtItal}
                    setValue={setCsTtItal}
                    presets={[
                        { name: "Roman", value: 0 },
                        { name: "Italic", value: 1 },
                    ]}
                    min={AXIS_RANGES.ital.min}
                    max={AXIS_RANGES.ital.max}
                    format={(v) => `${Math.round(v * 100)}%`}
                    styles={csTtStyles}
                    rowWidth={rowWidth}
                    handleSize={handleSize}
                />
            )
        if (key === "Geom")
            return (
                <MorphControl
                    key="Geom"
                    label="Geometric Form"
                    value={csTtGeom}
                    setValue={setCsTtGeom}
                    presets={GEOM_PRESET_LIST.map((p) => ({
                        name: p.name,
                        value: p.geom,
                    }))}
                    min={0}
                    max={100}
                    format={(v) => `${Math.round(v)}%`}
                    styles={csTtStyles}
                    rowWidth={rowWidth}
                    handleSize={handleSize}
                />
            )
        return renderSlider(sliderDefs[key])
    }

    // Wide → 4-up using the 4-column row order; narrow → 2-up using the 2-column order.
    const ORDER_4 = ["Size", "Weight", "Optical", "Italic", "Tracking", "Ascender", "Sharpness", "Geom"]
    const ORDER_2 = ["Weight", "Optical", "Size", "Tracking", "Ascender", "Sharpness", "Italic", "Geom"]
    const fourUp = containerWidth >= 720
    const order = fourUp ? ORDER_4 : ORDER_2
    const cols = fourUp ? 4 : 2

    return (
        <section style={csTtStyles.container} ref={containerRef}>
            {/* dirty-state reset — top-right of the module (controls now live at the
                bottom, so the reset moves up here, out of their way) */}
            <motion.div
                onClick={handleReset}
                initial={{ opacity: 0 }}
                animate={{
                    opacity: hasChanged ? 0.5 : 0,
                    pointerEvents: hasChanged ? "auto" : "none",
                    rotate: controls.rotate,
                }}
                whileHover={{ opacity: 1 }}
                style={{
                    position: "absolute",
                    top: 16 + offsetY,
                    right: gapX,
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 5,
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

            <div style={csTtStyles.previewClamp}>
                <textarea
                    ref={csTtTextareaRef}
                    style={csTtStyles.preview}
                    spellCheck={false}
                    value={csTtText}
                    onChange={(e) => setCsTtText(e.target.value)}
                />
            </div>

            <div
                style={{
                    ...csTtStyles.controlsGroup,
                    gridTemplateColumns: `repeat(${cols}, ${rowWidth}px)`,
                }}
            >
                {order.map(renderControl)}
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
        </section>
    )
}

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

addPropertyControls(CustomTypeTester, {
    ...FONT_CONTROLS,
    defaultContent: {
        type: ControlType.String,
        title: "Content",
        defaultValue: "Type away...",
        displayTextArea: true,
    },
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
        min: 12,
        max: 350,
        defaultValue: 100,
    },
    defaultSpacing: {
        type: ControlType.Number,
        title: "Spacing",
        min: -10,
        max: 10,
        step: 0.5,
        defaultValue: 0,
    },
    rowPaddingTop: {
        type: ControlType.Number,
        title: "Row Padding",
        defaultValue: 0,
        min: -100,
        max: 100,
    },
    previewHeight: {
        type: ControlType.Number,
        title: "Preview Height",
        defaultValue: 140,
        min: 40,
        max: 600,
        unit: "px",
    },
    refreshColor: {
        type: ControlType.Color,
        title: "Reset Color",
        defaultValue: "#666",
    },
    refreshSize: {
        type: ControlType.Number,
        title: "Reset Size",
        defaultValue: 16,
    },
    gapX: {
        type: ControlType.Number,
        title: "Gap X",
        defaultValue: 15,
        min: -2000,
        max: 2000,
    },
    offsetY: {
        type: ControlType.Number,
        title: "Nudge Y",
        defaultValue: 0,
        min: -100,
        max: 100,
    },
    debug: {
        type: ControlType.Boolean,
        title: "Debug Badge",
        defaultValue: false,
    },
})
