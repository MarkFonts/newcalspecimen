import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback,
} from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
// Font-version machinery + v2 GEOM presets/weights live in Shared.tsx (Phase 2).
// Re-Copy-Import after any Shared edit — the @<hash> in the URL is a version pin.
import {
    calFont,
    FONT_CONTROLS,
    buildFontFaceCSS,
    readFontRevision,
    GEOM_PRESET_LIST,
    WEIGHTS,
} from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"
// Shared header controls (V/h/I, GEOM pill, dropdowns, radii). Re-Copy-Import from
// SharedTester's ••• menu after editing it — the @<hash> pins the version.
import {
    AxisToggles,
    GeomToggle,
    ChevronSelect,
    buildGeomOpszOptions,
    opszIsText,
} from "https://framer.com/m/SharedTester-SB64gG.js@Dd5hSuq9KXwyNAlMQCX7"

const weightName = (w: number) =>
    WEIGHTS.find((x) => x.value === w)?.name ?? ""

// Mobile GEOM×opsz dropdown options (Display + Text variant per family).
const MOBILE_GEOM_OPTS = buildGeomOpszOptions(GEOM_PRESET_LIST)

// Per-component size sets (VISION §6 control system). ONE uniform font + padding drives
// every control — name label, GEOM toggle, V/h/I, and the mobile dropdowns — so they
// all match. `mobile` picks Small (the ~320px representation) vs Large.
const SIZE_LARGE = {
    font: "14px",
    pad: "3px 8px",
    labelW: "168px",
    gap: 10,
    pillPad: 2,
    pillGap: 2,
}
const SIZE_SMALL = {
    font: "11px",
    pad: "2px 6px",
    labelW: "120px",
    gap: 6,
    pillPad: 1,
    pillGap: 1,
}

// Measurement note (VISION §5): canvas ctx.font is CSS shorthand — it CANNOT carry
// font-variation-settings, so opsz/GEOM are invisible and at 100px font-optical-sizing
// pushes canvas to a different opsz than the card renders → wrong width → overflow.
// We instead read the rendered element's offsetWidth (honors every active axis exactly,
// ignores the parent transform). Step B's shared shaper can replace this if the per-card
// reflow ever becomes a perf issue.

// Module-level shared ResizeObserver
type ResizeCallback = (width: number) => void
const observerCallbacks = new WeakMap<Element, ResizeCallback>()
let _sharedObserver: ResizeObserver | null = null

function getSharedObserver() {
    if (!_sharedObserver) {
        _sharedObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const cb = observerCallbacks.get(entry.target)
                if (cb) cb(entry.contentRect.width)
            }
        })
    }
    return _sharedObserver
}

function observeElement(el: Element, cb: ResizeCallback) {
    observerCallbacks.set(el, cb)
    getSharedObserver().observe(el)
    return () => {
        getSharedObserver().unobserve(el)
        observerCallbacks.delete(el)
    }
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

/**
 * Width FIXED so the card fills its frame's width (gives the ResizeObserver a real,
 * constrained width to fit text against — not a content-driven phantom width that
 * makes the auto-scale run away). Height AUTO so the card is as tall as its content.
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function CalSansSpecimenCard(props) {
    const {
        defaultContent = "Specimen",
        weight: weightProp = 400,
        geom: propGeom = 1,
        opsz: opszProp = 14,
        refreshColor = "#999",
        showGeomToggle = true,
        headerGap = 8,
        mobile = false,
        debug = false,
    } = props

    const ver = calFont(props)

    const [text, setText] = useState(defaultContent)
    const [geom, setGeom] = useState(propGeom) // index into GEOM_PRESET_LIST
    // weight + opsz are state (not just props) so the mobile-mode dropdowns can drive
    // them; they re-sync to the props (the per-row config) whenever those change.
    const [weight, setWeight] = useState(weightProp)
    const [opsz, setOpsz] = useState(opszProp)
    // V / h / I axis on-off toggles, pulled from GlyphPicker: SHRP / YTAS / ital
    const [sharp, setSharp] = useState(false)
    const [ascend, setAscend] = useState(false)
    const [italic, setItalic] = useState(false)
    const [scale, setScale] = useState(1)
    const [containerWidth, setContainerWidth] = useState(0)

    // Version badge state — what the loaded BINARY actually reports.
    const [probe, setProbe] = useState("…")
    const [loaded, setLoaded] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    useIOSFocusScrollGuard(textRef)
    const cursorRef = useRef<number>(0)
    const controls = useAnimation()
    const isDirty = text !== defaultContent

    const preset = GEOM_PRESET_LIST[geom] ?? GEOM_PRESET_LIST[1]
    const geomValue = preset.geom
    // Full specimen name, mirroring the font's own instance names: both Display (opsz)
    // and Base (GEOM) are ELIDED; Text and A11y/UI/Geo are spelled out; the weight is
    // always shown. opsz: ≥24 Display(elided), else Text.
    const opszWord = opszIsText(opsz) ? "Text" : ""
    const geomWord = preset.elide ? "" : preset.name // Base elided
    const fullName = ["Cal Sans", opszWord, geomWord, weightName(weight)]
        .filter(Boolean)
        .join(" ")
    // One uniform control size — name label, GEOM toggle, V/h/I, and the mobile
    // dropdowns all share this font + padding. Mobile mode uses the Small set; the
    // exposed `mobile` prop drives the swap so Framer breakpoints own it.
    const sz = mobile ? SIZE_SMALL : SIZE_LARGE

    // Font injection — one <style> per build family, shared across all instances.
    useEffect(() => {
        const styleId = `cs-specimen-font-${ver.family}`
        if (!document.getElementById(styleId)) {
            const style = document.createElement("style")
            style.id = styleId
            style.textContent = buildFontFaceCSS(ver)
            document.head.appendChild(style)
        }
        // No cleanup — let it persist for all instances
    }, [ver.family])

    // Badge probe — read the build straight from the rendered binary. Dev-only: the
    // badge (and everything this effect feeds) is gated behind `debug`, so skip the
    // fetch+parse entirely when off (this card runs ~15×/page — that's 15 wasted
    // font-binary fetches on the common path).
    useEffect(() => {
        if (!debug) return
        let alive = true
        setProbe("probing…")
        readFontRevision(ver.url).then((r) => alive && setProbe(r))
        const face = `${weight} 24px "${ver.family}"`
        const check = () => alive && setLoaded(document.fonts.check(face))
        check()
        document.fonts.ready.then(check)
        return () => {
            alive = false
        }
    }, [ver.family, ver.url, weight, debug])

    useEffect(() => setText(defaultContent), [defaultContent])
    useEffect(() => setGeom(propGeom), [propGeom])
    useEffect(() => setWeight(weightProp), [weightProp])
    useEffect(() => setOpsz(opszProp), [opszProp])

    // Single shared observer instead of 15 window listeners
    useEffect(() => {
        if (!containerRef.current) return
        return observeElement(containerRef.current, (width) => {
            setContainerWidth(width)
        })
    }, [])

    // Fit text to container width by measuring the RENDERED element (offsetWidth = the
    // real 100px-font width, honoring opsz/GEOM/SHRP/ital; transform-independent).
    // useLayoutEffect so the scale is set before paint (no flash); re-fit on fonts.ready.
    useLayoutEffect(() => {
        if (containerWidth === 0 || !textRef.current) return
        let cancelled = false
        const fit = () => {
            const el = textRef.current
            if (cancelled || !el) return
            const w = el.offsetWidth
            if (w > 0) setScale(containerWidth / w)
        }
        fit()
        document.fonts?.ready.then(fit)
        return () => {
            cancelled = true
        }
    }, [
        containerWidth,
        text,
        weight,
        geomValue,
        opsz,
        sharp,
        ascend,
        italic,
        ver.family,
    ])

    const currentFontSize = 100 * scale
    const dynamicPadding =
        currentFontSize <= 5
            ? 5
            : currentFontSize <= 150
              ? 5 + (currentFontSize - 5) * (15 / 145)
              : 20 + (currentFontSize - 150) * (20 / 250)

    const restoreCursorPosition = useCallback(() => {
        const el = textRef.current
        if (!el || !el.childNodes[0]) return
        const selection = window.getSelection()
        const range = document.createRange()
        try {
            const offset = Math.min(
                cursorRef.current,
                el.childNodes[0].textContent.length
            )
            range.setStart(el.childNodes[0], offset)
            range.collapse(true)
            selection.removeAllRanges()
            selection.addRange(range)
        } catch (e) {}
    }, [])

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const selection = window.getSelection()
        if (selection?.rangeCount > 0) {
            cursorRef.current = selection.getRangeAt(0).startOffset
        }
        setText(e.currentTarget.innerText)
        requestAnimationFrame(restoreCursorPosition)
    }

    const handleReset = async () => {
        await controls.start({ rotate: -360, transition: { duration: 0.4 } })
        setText(defaultContent)
        controls.set({ rotate: 0 })
    }

    const styles = {
        container: {
            width: "100%",
            display: "flex",
            flexDirection: "column" as const,
            background: "transparent",
            fontFamily: `"${ver.family}", sans-serif`,
            paddingBottom: `${dynamicPadding}px`,
            overflow: "visible",
            position: "relative" as const,
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "32px",
            marginBottom: `${headerGap}px`,
            position: "relative" as const,
            zIndex: 10,
        },
        leftHeader: {
            display: "flex",
            alignItems: "center",
            gap: sz.gap,
            minWidth: 0,
        },
        label: {
            width: sz.labelW,
            flexShrink: 0,
            fontSize: sz.font,
            lineHeight: "1",
            fontWeight: 500,
            color: "#242424",
            fontVariationSettings: '"wght" 500, "GEOM" 25',
            whiteSpace: "nowrap" as const,
        },
        mobileHeaderRow: {
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap" as const,
            minWidth: 0,
        },
        scaleWrapper: {
            width: "100%",
            transformOrigin: "left top",
            display: "block",
            whiteSpace: "nowrap" as const,
            height: `${currentFontSize * 0.88}px`,
            position: "relative" as const,
            zIndex: 1,
            pointerEvents: "none" as const,
        },
        editable: {
            display: "inline-block",
            outline: "none",
            fontSize: "100px",
            lineHeight: "1",
            fontWeight: weight,
            fontOpticalSizing: "none", // explicit opsz below; WebKit drops opsz = default and auto-sizes over it
            fontStyle: italic ? "italic" : "normal", // the cossui build italicises by file, not by the ital axis
            fontVariationSettings: `"opsz" ${opsz}, "wght" ${weight}, "GEOM" ${geomValue}, "SHRP" ${sharp ? 100 : 0}, "YTAS" ${ascend ? 1600 : 720}, "ital" ${italic ? 1 : 0}`,
            color: "#111",
            cursor: "text",
            padding: 0,
            margin: 0,
            pointerEvents: "auto" as const,
        } as React.CSSProperties,
    }

    // Current mobile dropdown-1 selection (GEOM family + Text/Display opsz).
    const mobileSel = Math.max(
        0,
        MOBILE_GEOM_OPTS.findIndex(
            (o) => o.geom === geom && opszIsText(o.opsz) === opszIsText(opsz)
        )
    )

    // Shared V/h/I toggles wired to this card's axis state + size set.
    const axisToggles = (mobileVariant: boolean) => (
        <AxisToggles
            family={ver.family}
            size={sz}
            mobile={mobileVariant}
            sharp={sharp}
            ascend={ascend}
            italic={italic}
            onSharp={() => setSharp((v) => !v)}
            onAscend={() => setAscend((v) => !v)}
            onItalic={() => setItalic((v) => !v)}
        />
    )

    return (
        <div style={styles.container} ref={containerRef}>
            <div style={styles.header}>
                {mobile ? (
                    /* Mobile: GEOM×opsz dropdown + weight dropdown (borderless +
                       chevron) + V/h/I outlined boxes. No written name label. */
                    <div style={styles.mobileHeaderRow}>
                        <ChevronSelect
                            family={ver.family}
                            size={sz}
                            value={mobileSel}
                            onChange={(v) => {
                                const o = MOBILE_GEOM_OPTS[+v]
                                setGeom(o.geom)
                                setOpsz(o.opsz)
                            }}
                            options={MOBILE_GEOM_OPTS.map((o, i) => ({
                                label: o.label,
                                value: i,
                            }))}
                        />
                        <ChevronSelect
                            family={ver.family}
                            size={sz}
                            value={weight}
                            onChange={(v) => setWeight(+v)}
                            options={WEIGHTS.map((w) => ({
                                label: w.name,
                                value: w.value,
                            }))}
                        />
                        {axisToggles(true)}
                    </div>
                ) : (
                    /* Desktop: written name + GEOM pill + V/h/I gray pill. */
                    <div style={styles.leftHeader}>
                        <div style={styles.label}>{fullName}</div>
                        {showGeomToggle && (
                            <GeomToggle
                                family={ver.family}
                                size={sz}
                                geom={geom}
                                onChange={setGeom}
                                presets={GEOM_PRESET_LIST}
                            />
                        )}
                        {axisToggles(false)}
                    </div>
                )}
                <AnimatePresence>
                    {isDirty && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleReset}
                            style={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                zIndex: 11,
                            }}
                        >
                            <motion.svg
                                animate={controls}
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <path
                                    fill={refreshColor}
                                    fillRule="evenodd"
                                    d="M13.5 8c0-3.034-2.474-5.5-5.535-5.5a5.53 5.53 0 0 0-5.328 4H6V8H.75A.75.75 0 0 1 0 7.25V2h1.5v3.233A7.04 7.04 0 0 1 7.965 1C11.846 1 15 4.13 15 8s-3.154 7-7.035 7a7.04 7.04 0 0 1-5.695-2.888l-.442-.605 1.211-.885.443.605A5.54 5.54 0 0 0 7.965 13.5c3.06 0 5.535-2.466 5.535-5.5"
                                    clipRule="evenodd"
                                />
                            </motion.svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div
                style={{ ...styles.scaleWrapper, transform: `scale(${scale})` }}
            >
                <div
                    ref={textRef}
                    style={styles.editable}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    spellCheck={false}
                >
                    {text}
                </div>
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
        </div>
    )
}

const badgeStyle: React.CSSProperties = {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 99999,
    background: "rgba(20,20,20,0.85)",
    color: "#E6FF7A",
    font: "11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",
    padding: "8px 10px",
    borderRadius: 8,
    pointerEvents: "none",
    whiteSpace: "pre",
}

addPropertyControls(CalSansSpecimenCard, {
    ...FONT_CONTROLS,
    defaultContent: {
        type: ControlType.String,
        title: "Text",
        defaultValue: "Specimen",
    },
    headerGap: {
        type: ControlType.Number,
        title: "Header Gap",
        min: 0,
        max: 120,
        defaultValue: 8,
        displayStepper: true,
    },
    weight: {
        type: ControlType.Enum,
        title: "Style",
        options: WEIGHTS.map((w) => w.value),
        optionTitles: WEIGHTS.map((w) => w.name),
        defaultValue: 400,
    },
    geom: {
        type: ControlType.Number,
        title: "GEOM Preset",
        min: 0,
        max: GEOM_PRESET_LIST.length - 1,
        step: 1,
        defaultValue: 1,
    },
    opsz: {
        type: ControlType.Number,
        title: "Optical Size",
        min: 8,
        max: 45,
        step: 1,
        defaultValue: 14,
        displayStepper: true,
    },
    showGeomToggle: {
        type: ControlType.Boolean,
        title: "Show Toggle",
        defaultValue: true,
    },
    refreshColor: {
        type: ControlType.Color,
        title: "Reset Color",
        defaultValue: "#999",
    },
    mobile: {
        type: ControlType.Boolean,
        title: "Mobile",
        defaultValue: false,
    },
    debug: {
        type: ControlType.Boolean,
        title: "Debug Badge",
        defaultValue: false,
    },
})
