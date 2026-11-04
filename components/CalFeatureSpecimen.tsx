import { addPropertyControls, ControlType } from "framer"
import { useEffect, useState } from "react"
import { CAL_SANS, buildFontFaceCSS } from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"

// ─────────────────────────────────────────────────────────────────────────────
// CalFeatureSpecimen.tsx — a single OpenType-feature specimen CARD for Cal Sans v2.
// Place one per feature (~50 total); each picks a `feature` and shows a `sample` word
// with that feature ON. Replaces the native component+variant OpentypeHover.
//
// • Loads the full Cal Sans v2 font directly from the CDN (self-contained — needs no
//   withCalSans override, no MODE→GEOM remap, no page observer). GEOM/weight/opsz are
//   chosen here as font-variation-settings.
// • `hoverShowsDefault`: on rollover the feature turns OFF so you see the plain glyph
//   — the built-in before/after (the old Primary/Hover variants, for free).
// • Hugs its content (auto width/height), so drop ~50 into a Framer stack/grid and set
//   that container's columns per breakpoint for "how many per line".
// ─────────────────────────────────────────────────────────────────────────────


type Feat = { tag: string; label: string }

// Pulled from the font's GSUB UI-name table (CalSansVF.ttf, 20-set build).
const STYLISTIC_SETS: Feat[] = [
    { tag: "ss01", label: "Geometric a" },
    { tag: "ss02", label: "Humanist a" },
    { tag: "ss03", label: "Tailed a" },
    { tag: "ss04", label: "Geometric g" },
    { tag: "ss05", label: "Gothic g" },
    { tag: "ss06", label: "Geometric G" },
    { tag: "ss07", label: "Humanist G" },
    { tag: "ss08", label: "Constructed j and y" },
    { tag: "ss09", label: "Humanist j and y" },
    { tag: "ss10", label: "Futura alternatives" },
    { tag: "ss11", label: "Futura alternatives and ligations" },
    { tag: "ss12", label: "Angular M" },
    { tag: "ss13", label: "Square M" },
    { tag: "ss14", label: "Constructed f and t" },
    { tag: "ss15", label: "Humanist f and t" },
    { tag: "ss16", label: "Humanist/Grotesk 6 and 9" },
    { tag: "ss17", label: "Geometric/legible 6 and 9" },
    { tag: "ss18", label: "A11Y I l a" },
    { tag: "ss19", label: "Constructed l" },
    { tag: "ss20", label: "Horizontal Sharps" },
]

const NAMED_FEATURES: Feat[] = [
    { tag: "case", label: "Case-Sensitive Forms" },
    { tag: "zero", label: "Slashed Zero" },
    { tag: "titl", label: "Titling" },
    { tag: "dlig", label: "Discretionary Ligatures" },
    { tag: "frac", label: "Fractions" },
    { tag: "sups", label: "Superscript" },
    { tag: "subs", label: "Subscript" },
    { tag: "numr", label: "Numerators" },
    { tag: "dnom", label: "Denominators" },
    { tag: "sinf", label: "Scientific Inferiors" },
    { tag: "ordn", label: "Ordinals" },
    { tag: "pnum", label: "Proportional Figures" },
    { tag: "tnum", label: "Tabular Figures" },
    // kern & liga skipped: on by default, no visible hover before/after.
]

const CHAR_VARIANTS: Feat[] = [
    { tag: "cv01", label: "Geometric a" },
    { tag: "cv02", label: "Humanist a" },
    { tag: "cv03", label: "Accessible/tailed a" },
    { tag: "cv04", label: "Geometric ae" },
    { tag: "cv05", label: "Humanist ae" },
    { tag: "cv06", label: "Futura-style C" },
    { tag: "cv07", label: "Constructed f" },
    { tag: "cv08", label: "Geometric g" },
    { tag: "cv09", label: "Gothic g" },
    { tag: "cv10", label: "Geometric G" },
    { tag: "cv11", label: "Humanist G" },
    { tag: "cv12", label: "Accessible/seriffed I" },
    { tag: "cv13", label: "Constructed j" },
    { tag: "cv14", label: "Geometric j" },
    { tag: "cv15", label: "Accessible/seriffed l" },
    { tag: "cv16", label: "Constructed l" },
    { tag: "cv17", label: "Angled M" },
    { tag: "cv18", label: "Constructed t" },
    { tag: "cv19", label: "Futura-style t" },
    { tag: "cv20", label: "Futura-style u" },
    { tag: "cv21", label: "Constructed y" },
    { tag: "cv22", label: "Geometric y" },
    { tag: "cv23", label: "Futura-style zero" },
    { tag: "cv24", label: "Futura-style one" },
    { tag: "cv25", label: "Geometric five" },
    { tag: "cv26", label: "Humanist/Grotesk 6" },
    { tag: "cv27", label: "Humanist/Grotesk 9" },
    { tag: "cv28", label: "Geometric/legible 6" },
    { tag: "cv29", label: "Geometric/legible 9" },
    { tag: "cv30", label: "Open-aperture 6" },
    { tag: "cv31", label: "Open-aperture 9" },
    { tag: "cv32", label: "Constructed ffi" },
    { tag: "cv33", label: "Futura Ligation ffi" },
    { tag: "cv34", label: "Constructed ffl" },
    { tag: "cv35", label: "Futura Ligation ffl" },
    { tag: "cv36", label: "Constructed fi" },
    { tag: "cv37", label: "Futura discretionary ligation fi" },
    { tag: "cv38", label: "Constructed fl" },
    { tag: "cv39", label: "Futura discretionary ligation fl" },
    { tag: "cv40", label: "Constructed ft" },
    { tag: "cv41", label: "Futura ligation ft" },
    { tag: "cv42", label: "Futura discretionary ligation ft" },
]

const FEATURES: Feat[] = [
    ...STYLISTIC_SETS,
    ...NAMED_FEATURES,
    ...CHAR_VARIANTS,
]
const FEATURE_TAGS = FEATURES.map((f) => f.tag)
const FEATURE_TITLES = FEATURES.map((f) => `${f.tag} — ${f.label}`)
// "Compare" dropdown: same list + a leading "none" that falls back to GEOM-# behavior.
const FEATURE2_TAGS = ["none", ...FEATURE_TAGS]
const FEATURE2_TITLES = ["— none (reveal default)", ...FEATURE_TITLES]
const LABELS: Record<string, string> = Object.fromEntries(
    FEATURES.map((f) => [f.tag, f.label])
)

const STYLE_ID = "calspec-css"
const CSS = buildFontFaceCSS()

function injectCSS() {
    if (typeof document === "undefined") return
    if (!document.getElementById(STYLE_ID)) {
        const el = document.createElement("style")
        el.id = STYLE_ID
        el.textContent = CSS
        document.head.appendChild(el)
    }
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function CalFeatureSpecimen(props: any) {
    const {
        feature,
        feature2,
        sample,
        labelOverride,
        fontSize,
        weight,
        geom,
        opsz,
        gap,
        padding,
        cardBg,
        textColor,
        labelColor,
        labelSize,
        showLabel,
        hoverShowsDefault,
        style,
    } = props

    const [hovered, setHovered] = useState(false)

    useEffect(() => {
        injectCSS()
    }, [])

    const fvs = `"opsz" ${opsz}, "wght" ${weight}, "GEOM" ${geom}`

    // On a hover-demo card, hovering turns the feature OFF to reveal the base glyph.
    const showingDefault = hovered && hoverShowsDefault
    // Compare mode: hover engages Feature 2 (instead of the plain default) and shows
    // its label where "GEOM #" normally goes. "none"/blank falls back to default.
    const compare = feature2 && feature2 !== "none"

    const autoLabel = labelOverride?.trim()
        ? labelOverride
        : `${feature} — ${LABELS[feature] ?? ""}`

    const labelBase = {
        fontFamily: `"${CAL_SANS.family}", sans-serif`,
        fontSize: labelSize,
        fontOpticalSizing: "none",
        fontVariationSettings: '"opsz" 10, "wght" 500',
        lineHeight: 1.4,
        whiteSpace: "nowrap",
    }

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                ...style,
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap,
                width: "100%",
                height: "auto",
            }}
        >
            {showLabel && (
                <div style={{ ...labelBase, color: labelColor }}>
                    {showingDefault ? (
                        <>
                            <span style={{ fontStyle: "normal", color: labelColor }}>
                                {compare
                                    ? `${feature2} — ${LABELS[feature2] ?? ""}`
                                    : `GEOM ${geom}`}
                            </span>{" "}
                            <span
                                style={{
                                    fontStyle: "italic",
                                    fontVariationSettings:
                                        '"opsz" 10, "wght" 500, "ital" 1',
                                    color: "#E1E2E3",
                                }}
                            >
                                {autoLabel}
                            </span>
                        </>
                    ) : (
                        autoLabel
                    )}
                </div>
            )}
            <div
                style={{
                    background: cardBg,
                    padding,
                    borderRadius: 6,
                    overflow: "hidden",
                }}
            >
                <span
                    style={{
                        fontFamily: `"${CAL_SANS.family}", sans-serif`,
                        fontSize,
                        fontOpticalSizing: "none",
                        fontVariationSettings: fvs,
                        fontFeatureSettings: showingDefault
                            ? compare
                                ? `"${feature2}" 1`
                                : "normal"
                            : `"${feature}" 1`,
                        color: textColor,
                        whiteSpace: "nowrap",
                    }}
                >

                    {sample}
                </span>
            </div>
        </div>
    )
}

addPropertyControls(CalFeatureSpecimen, {
    feature: {
        type: ControlType.Enum,
        title: "Feature",
        options: FEATURE_TAGS,
        optionTitles: FEATURE_TITLES,
        defaultValue: "ss01",
    },
    feature2: {
        type: ControlType.Enum,
        title: "Compare",
        options: FEATURE2_TAGS,
        optionTitles: FEATURE2_TITLES,
        defaultValue: "none",
    },
    sample: {
        type: ControlType.String,
        title: "Sample",
        defaultValue: "sample",
    },
    labelOverride: {
        type: ControlType.String,
        title: "Label",
        defaultValue: "",
        placeholder: "auto (feature — name)",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 64,
        min: 12,
        max: 200,
        step: 1,
        unit: "px",
    },
    weight: {
        type: ControlType.Number,
        title: "Weight",
        defaultValue: 400,
        min: 400,
        max: 700,
        step: 10,
    },
    geom: {
        type: ControlType.Number,
        title: "GEOM",
        defaultValue: 25,
        min: 0,
        max: 100,
        step: 1,
    },
    opsz: {
        type: ControlType.Number,
        title: "Optical",
        defaultValue: 45,
        min: 8,
        max: 45,
        step: 1,
    },
    gap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: 8,
        min: 0,
        max: 120,
        step: 1,
        unit: "px",
    },
    padding: {
        type: ControlType.Padding,
        title: "Padding",
        defaultValue: "24px",
    },
    cardBg: {
        type: ControlType.Color,
        title: "Card BG",
        defaultValue: "#f4f4f4",
    },
    textColor: {
        type: ControlType.Color,
        title: "Text",
        defaultValue: "#111111",
    },
    labelColor: {
        type: ControlType.Color,
        title: "Label",
        defaultValue: "#999999",
    },
    labelSize: {
        type: ControlType.Number,
        title: "Label Size",
        defaultValue: 13,
        min: 6,
        max: 48,
        step: 1,
        unit: "px",
    },

    showLabel: {
        type: ControlType.Boolean,
        title: "Show Label",
        defaultValue: true,
    },
    hoverShowsDefault: {
        type: ControlType.Boolean,
        title: "Hover → Default",
        defaultValue: true,
    },
})
