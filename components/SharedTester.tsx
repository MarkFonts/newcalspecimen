import * as React from "react"

// ─────────────────────────────────────────────────────────────────────────────
// SharedTester.tsx — shared values for the TYPE-PROOFING testers (CustomTypeTester,
// KaossTester). Kept SEPARATE from Shared.tsx: this churns as we iterate the tester
// UI, so editing it only re-copies the 2 testers, never the 6 components on Shared.
//
// Canonical FONT-AXIS ranges (opsz/wght/GEOM/YTAS/SHRP/ital min·default·max) live in
// Shared.AXIS_RANGES. THIS file holds tester DISPLAY metadata: labels, units, the
// coordinate stops to show, and the ranges for the CSS pseudo-axes (size, tracking)
// that aren't font axes.
//
// IMPORT (Framer): ••• on this code file → "Copy Import" → keep the named exports.
// The @<hash> is a version pin; re-copy after every edit here.
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE_TEXT = "Type away..."

export const AXIS_META = {
    opsz: { label: "Optical", unit: "pt", stops: [8, 14, 30, 45] },
    wght: { label: "Weight", unit: "", stops: [400, 500, 600, 700] },
    spacing: { label: "Tracking", unit: "%", min: -10, max: 10, stops: [-10, 0, 10] },
    size: { label: "Size", unit: "px", min: 8, max: 350, stops: [8, 100, 200, 350] },
    shrp: { label: "Sharp", unit: "", stops: [0, 50, 100] },
    ytas: { label: "Ascend", unit: "", stops: [1440, 1520, 1600] },
    geom: { label: "Geom", unit: "", stops: [0, 25, 50, 100] },
    ital: { label: "Italic", unit: "", stops: [0, 1] },
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HEADER CONTROLS — reused across the testers/specimens (CalSansSpecimenCard
// first; GlyphPicker next). Sizing is passed in PER HOST (each component hard-codes its
// own Large/Small `size` = { font, pad }); only the radii are globally consistent.
// ─────────────────────────────────────────────────────────────────────────────

// Consistent radii across every control (colors may differ between control types,
// radii don't): one for outer pills/containers, one for the inner buttons.
export const RADIUS_PILL = 8
export const RADIUS_BTN = 6

// V / h / I axis toolbar CSS — namespaced cs-axis-*, family interpolated. Self-demo
// glyphs (each button rendered with its axis maxed) + the interpolating hover-sweep.
export function buildAxisToolbarCSS(family: string) {
    return `
.cs-axis-toggles {
    display: inline-flex;
    width: fit-content;
    background: #F3F4F6;
    border-radius: ${RADIUS_PILL}px;
    padding: 4px;
    gap: 2px;
    align-items: center;
    flex-shrink: 0;
}
.cs-axis-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 1.7em;
    font-family: "${family}", system-ui, sans-serif;
    font-weight: 700;
    line-height: 1;
    border: none;
    border-radius: ${RADIUS_BTN}px;
    background: transparent;
    color: #898989;
    cursor: pointer;
    transition: background 150ms ease-out, color 150ms ease-out;
}
.cs-axis-btn:hover { background: rgba(0,0,0,0.04); color: #242424; }
.cs-axis-btn.active { background: #242424; color: #ffffff; }
@keyframes cs-axis-cycle-shrp { from { font-variation-settings: "SHRP" 0; } to { font-variation-settings: "SHRP" 100; } }
@keyframes cs-axis-cycle-ytas { from { font-variation-settings: "YTAS" 1440; } to { font-variation-settings: "YTAS" 1600; } }
@keyframes cs-axis-cycle-ital { from { font-variation-settings: "ital" 0, "GEOM" 0; } to { font-variation-settings: "ital" 1, "GEOM" 0; } }
.cs-axis-btn--shrp:hover { animation: cs-axis-cycle-shrp 0.9s ease-in-out infinite alternate; }
.cs-axis-btn--ytas:hover { animation: cs-axis-cycle-ytas 0.9s ease-in-out infinite alternate; }
.cs-axis-btn--ital:hover { animation: cs-axis-cycle-ital 0.9s ease-in-out infinite alternate; }
/* Mobile variant: standalone outlined boxes instead of one gray pill. */
.cs-axis-toggles--mobile { background: transparent; padding: 0; gap: 6px; }
.cs-axis-btn--mobile { border: 1px solid #DADADA; }
.cs-axis-btn--mobile.active { background: #242424; color: #ffffff; border-color: #242424; }
`
}

// Controlled V / h / I toggle group (SHRP / YTAS / ital). Self-injects its CSS per family.
// `size` = { font, pad } from the host. `mobile` → outlined-box variant.
// Framer's code preview renders each exported component with no props, so every
// prop that is read unguarded needs a default.
const DEFAULT_SIZE = { font: "14px", pad: "3px 8px", pillPad: 2, pillGap: 2 }

export function AxisToggles({
    family,
    size = DEFAULT_SIZE,
    mobile = false,
    sharp,
    ascend,
    italic,
    onSharp,
    onAscend,
    onItalic,
}: {
    family: string
    size?: { font: string; pad: string }
    mobile?: boolean
    sharp: boolean
    ascend: boolean
    italic: boolean
    onSharp: () => void
    onAscend: () => void
    onItalic: () => void
}) {
    React.useEffect(() => {
        const id = `cs-axis-css-${family}`
        let el = document.getElementById(id) as HTMLStyleElement | null
        if (!el) {
            el = document.createElement("style")
            el.id = id
            document.head.appendChild(el)
        }
        el.textContent = buildAxisToolbarCSS(family)
    }, [family])

    const s = { fontSize: size.font, padding: size.pad }
    const mod = mobile ? "cs-axis-btn--mobile" : ""
    return (
        <div
            className={`cs-axis-toggles ${mobile ? "cs-axis-toggles--mobile" : ""}`}
        >
            <button
                className={`cs-axis-btn ${mod} cs-axis-btn--shrp ${sharp ? "active" : ""}`}
                style={{ ...s, fontVariationSettings: '"SHRP" 100' }}
                onClick={onSharp}
                title="100% Sharp"
            >
                V
            </button>
            <button
                className={`cs-axis-btn ${mod} cs-axis-btn--ytas ${ascend ? "active" : ""}`}
                style={{ ...s, fontVariationSettings: '"YTAS" 1600' }}
                onClick={onAscend}
                title="100% Ascender"
            >
                h
            </button>
            <button
                className={`cs-axis-btn ${mod} cs-axis-btn--ital ${italic ? "active" : ""}`}
                style={{ ...s, fontStyle: "italic", fontVariationSettings: '"ital" 1, "GEOM" 0' }}
                onClick={onItalic}
                title="Italic"
            >
                I
            </button>
        </div>
    )
}

// Controlled GEOM preset pill (A11y / UI / Base / Geo). `presets` = Shared.GEOM_PRESET_LIST
// (passed in so this file stays a leaf — no Shared import chain). `size` supplies the
// uniform font/pad + pill padding/gap; `geom` is the active index.
export function GeomToggle({
    family,
    size = DEFAULT_SIZE,
    geom,
    onChange,
    presets = [],
}: {
    family: string
    size?: { font: string; pad: string; pillPad: number; pillGap: number }
    geom: number
    onChange: (i: number) => void
    presets?: { name: string }[]
}) {
    const pill: React.CSSProperties = {
        display: "inline-flex",
        background: "#F3F4F6",
        borderRadius: RADIUS_PILL,
        padding: size.pillPad,
        gap: size.pillGap,
        alignItems: "center",
        flexShrink: 0,
    }
    const btn = (active: boolean): React.CSSProperties => ({
        padding: size.pad,
        fontFamily: `"${family}", sans-serif`,
        fontSize: size.font,
        lineHeight: "1.2",
        fontWeight: 600,
        border: "none",
        borderRadius: RADIUS_BTN,
        background: active ? "#FFFFFF" : "transparent",
        color: active ? "#242424" : "#898989",
        cursor: "pointer",
        boxShadow: active ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
        fontVariationSettings: '"wght" 600, "GEOM" 25',
        whiteSpace: "nowrap",
    })
    return (
        <div style={pill}>
            {presets.map((p, i) => (
                <button
                    key={p.name}
                    style={btn(geom === i)}
                    onClick={() => onChange(i)}
                >
                    {p.name}
                </button>
            ))}
        </div>
    )
}

// Optical-size stops for the GEOM×opsz dropdown: Display (large, name elided) vs Text
// (small). Exported so hosts can map a selection back to (geom, opsz) + decide the opsz
// word in their labels.
export const DISPLAY_OPSZ = 36
export const TEXT_OPSZ = 10
export const opszIsText = (o: number) => o < 24

// Build the 8 GEOM×opsz dropdown options: each preset as a Display variant (opsz elided)
// + a Text variant. Pass Shared.GEOM_PRESET_LIST. Returns { label, geom, opsz }[].
export function buildGeomOpszOptions(presets: { name: string }[]) {
    return presets.flatMap((p, i) => [
        { label: p.name, geom: i, opsz: DISPLAY_OPSZ },
        { label: `Text ${p.name}`, geom: i, opsz: TEXT_OPSZ },
    ])
}

// Build the weight×opsz dropdown options: each weight as a Text variant + a Display
// variant (e.g. "Text Regular" / "Regular"). Pass Shared.WEIGHTS. Returns
// { label, weight, opsz }[].
export function buildWeightOpszOptions(weights: { name: string; value: number }[]) {
    return weights.flatMap((w) => [
        { label: `Text ${w.name}`, weight: w.value, opsz: TEXT_OPSZ },
        { label: w.name, weight: w.value, opsz: DISPLAY_OPSZ },
    ])
}

// Borderless dropdown + chevron (native <select>; the closed state is styled, the open
// list is OS-native). Generic — pass options {label, value}. Used for the GEOM×opsz and
// weight pickers on mobile and in the GlyphPicker style chooser.
export function ChevronSelect({
    family,
    size = DEFAULT_SIZE,
    value,
    onChange,
    options = [],
}: {
    family: string
    size?: { font: string }
    value: number | string
    onChange: (value: string) => void
    options?: { label: string; value: number | string }[]
}) {
    const wrap: React.CSSProperties = {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
    }
    const select: React.CSSProperties = {
        appearance: "none",
        WebkitAppearance: "none",
        border: "none",
        background: "transparent",
        fontFamily: `"${family}", sans-serif`,
        fontSize: size.font,
        fontWeight: 500,
        color: "#242424",
        padding: "0 16px 0 0",
        margin: 0,
        cursor: "pointer",
        fontVariationSettings: '"wght" 500, "GEOM" 25',
    }
    const chev: React.CSSProperties = {
        position: "absolute",
        right: 2,
        top: "50%",
        transform: "translateY(-50%)",
        width: 9,
        height: 5,
        pointerEvents: "none",
        color: "#242424",
    }
    return (
        <div style={wrap}>
            <select
                style={select}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((o) => (
                    <option key={String(o.value)} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            <svg
                style={chev}
                viewBox="0 0 8 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="0.6 0.6 4 3.4 7.4 0.6" />
            </svg>
        </div>
    )
}

// Default export so Framer registers this as an importable code file (renders nothing).
export default function SharedTester() {
    return null
}
