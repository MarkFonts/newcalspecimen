import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { calFont, buildFontFaceCSS, FONT_CONTROLS, type CalFont } from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"

// ─────────────────────────────────────────────────────────────────────────────
// CalFitSource.tsx — the SOURCE half of the fit-to-longest pair.
//
// This is the ONE widest specimen line. It fits its text to the container width
// and PUBLISHES the resulting px to the global CSS var `--cal-fit`, which every
// `withCalFitReceiver` layer reads. One-way: source → var → receivers (no loop).
//
// Put `withCalSans` on the PARENT frame so this (and the receivers) render in Cal
// Sans; the probe copies the element's COMPUTED style, so the forced family/axes
// are measured accurately. Set this line's own weight/geom/italic to match the
// actual widest name in your sheet (you pick it — it must genuinely be the widest,
// or shorter-but-wider receivers will overflow).
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 100 // reference size for the hidden measurement (px)

// Self-inject the full v2 font so measurement is accurate even without a
// withCalSans ancestor (guarded so it only lands once per page).
function injectCalFont(ver: CalFont) {
    if (typeof document === "undefined") return
    const id = `cal-font-src-${ver.family}`
    if (document.getElementById(id)) return
    const el = document.createElement("style")
    el.id = id
    el.textContent = buildFontFaceCSS(ver)
    document.head.appendChild(el)
}

export default function CalFitSource(props: any) {
    const { text, weight, geom, italic, color } = props
    const ver = calFont(props)
    const minSize = props.minSize ?? 30 // floor — text won't shrink below this
    const opsz = props.opsz ?? 45 // PINNED so probe & render share one optical size
    const ref = React.useRef<HTMLDivElement>(null)
    const [size, setSize] = React.useState(BASE)
    const [dbg, setDbg] = React.useState({ avail: 0, natural: 0 })
    const [dbg2, setDbg2] = React.useState({ real: "?", cf: "?" })

    // Debug effect DISABLED — it had NO dependency array and called setDbg2 with a
    // new object literal every render → infinite re-render loop that pegged the main
    // thread and froze all page timers (e.g. TypewriterEffect). Only fed the debug
    // overlay (off by default), so disabling it changes nothing that renders.
    // React.useEffect(() => {
    //     const span = ref.current?.firstElementChild as HTMLElement | null
    //     const real = span ? getComputedStyle(span).fontSize : "?"
    //     const cf =
    //         getComputedStyle(document.documentElement)
    //             .getPropertyValue("--cal-fit")
    //             .trim() || "unset"
    //     setDbg2({ real, cf })
    // })

    const fit = React.useCallback(() => {
        const el = ref.current
        const span = el?.firstElementChild as HTMLElement | null
        if (!el || !span) return
        // Measure natural width at a FIXED reference size via a hidden probe, so
        // the applied size never feeds back into the measurement.
        const cs = getComputedStyle(span)
        const probe = document.createElement("span")
        Object.assign(probe.style, {
            position: "absolute",
            left: "-99999px",
            top: "0",
            visibility: "hidden",
            whiteSpace: "nowrap",
            fontSize: BASE + "px",
            fontFamily: cs.fontFamily,
            fontWeight: cs.fontWeight,
            fontStyle: cs.fontStyle,
            letterSpacing: cs.letterSpacing,
            fontOpticalSizing: "none",
            fontVariationSettings: cs.fontVariationSettings, // carries pinned opsz
        } as CSSStyleDeclaration)
        probe.textContent = span.textContent || text
        document.body.appendChild(probe)
        const natural = probe.offsetWidth
        document.body.removeChild(probe)
        if (!natural) return

        // el's child is absolutely positioned → el can't inflate to the text, so
        // this is the true column width (immune to flexbox min-width:auto).
        const avail = el.clientWidth
        if (!avail) return // layout not settled — don't publish 0 (blanks receivers)
        const raw = (BASE * avail) / natural
        const target = Math.round(Math.max(minSize, raw) * 100) / 100
        setSize(target)
        setDbg({ avail: Math.round(avail), natural: Math.round(natural) })
        document.documentElement.style.setProperty("--cal-fit", target + "px")
    }, [text, minSize, opsz])

    React.useLayoutEffect(() => {
        injectCalFont(ver)
        fit()
        const ro = new ResizeObserver(fit)
        if (ref.current) ro.observe(ref.current) // watch the component's own box
        // refit once the variable font is actually loaded (metrics change)
        if (document.fonts?.ready) document.fonts.ready.then(fit)
        return () => ro.disconnect()
    }, [fit, ver.family])

    return (
        <div
            ref={ref}
            style={{
                position: "relative",
                width: "100%",
                minWidth: 0, // + absolute child ⇒ box = column, never the text
                height: Math.ceil(size * 1.25),
                textAlign: "left",
                overflow: "visible",
            }}
        >
            <span
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    whiteSpace: "nowrap",
                    fontSize: size,
                    fontFamily: `"${ver.family}", sans-serif`,
                    fontOpticalSizing: "none", // opsz comes from the pin below, not size
                    fontStyle: italic ? "italic" : "normal", // the cossui build italicises by file, not by the ital axis
                    fontVariationSettings: `"opsz" ${opsz}, "wght" ${weight}, "GEOM" ${geom}, "ital" ${italic ? 1 : 0}`,
                    color,
                    lineHeight: 1.25,
                }}
            >
                {text}
            </span>
            {props.debug && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        background: "#000",
                        color: "#0f0",
                        font: "10px/1.4 monospace",
                        padding: "2px 4px",
                        whiteSpace: "nowrap",
                        zIndex: 9,
                    }}
                >
                    {`avail ${dbg.avail} · nat ${dbg.natural} · size ${size} · real ${dbg2.real} · var ${dbg2.cf}`}
                </div>
            )}
        </div>
    )
}

addPropertyControls(CalFitSource, {
    ...FONT_CONTROLS,
    text: {
        type: ControlType.String,
        defaultValue: "Cal Sans A11y Medium Italic",
    },
    weight: {
        type: ControlType.Number,
        defaultValue: 500,
        min: 400,
        max: 700,
        step: 100,
    },
    geom: {
        type: ControlType.Number,
        defaultValue: 0,
        min: 0,
        max: 100,
        step: 25,
    },
    italic: { type: ControlType.Boolean, defaultValue: true },
    color: { type: ControlType.Color, defaultValue: "#111111" },
    minSize: {
        type: ControlType.Number,
        title: "Min Size",
        defaultValue: 30,
        min: 8,
        max: 200,
        step: 1,
        unit: "px",
    },
    opsz: {
        type: ControlType.Number,
        title: "Optical",
        defaultValue: 45,
        min: 8,
        max: 45,
        step: 1,
    },
    debug: { type: ControlType.Boolean, title: "Debug", defaultValue: false },
})
