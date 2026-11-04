import * as React from "react"
import { ControlType } from "framer"

// ─────────────────────────────────────────────────────────────────────────────
// Shared.tsx — single source of truth for the Cal Sans 2 @font-face, imported by
// every Cal Sans component (VISION §1 "Architecture", Phase 2).
//
// HOW TO IMPORT THIS IN FRAMER: relative paths do NOT work ("./Shared",
// "./Shared.tsx" both fail with "unable to resolve: codeFile/Shared"). Framer mints a
// URL per code file — open this file's ••• menu in the Code assets panel → "Copy
// Import" → paste, and keep only the named exports you need, e.g.:
//   import { CAL_SANS, buildFontFaceCSS } from "https://framer.com/m/Shared-XXXX.js@<hash>"
// The trailing @<hash> is a VERSION PIN: editing this file changes the hash, so each
// importer must re-copy the import (or it stays pinned to the old build). That re-copy
// cost is the real tradeoff of extracting Shared vs. inlining per-component.
//
// This file needs the default export below to register as an importable Framer code file.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// FONTS — two builds, chosen per component by the Font prop, never automatically.
//   CAL_SANS       full build: ss01–ss20, cv01–cv42, opsz 8–45, `ital` axis
//   CAL_SANS_COSS  coss ui build: opsz 8–32, Roman + Italic as two files, and NO
//                  stylistic sets or character variants
// Components that depend on the full build (stylistic sets, the whole glyph set, opsz
// 45) import CAL_SANS directly and get no Font prop.
// ─────────────────────────────────────────────────────────────────────────────
const JSD = "https://cdn.jsdelivr.net/gh/calcom/sans@main/fonts"

export type CalFont = { family: string; url: string; italicUrl?: string }

export const CAL_SANS: CalFont = {
    family: "Cal Sans 2",
    url: `${JSD}/calsans-var-full/CalSansVF.ttf`,
}

export const CAL_SANS_COSS: CalFont = {
    family: "Cal Sans 2 coss",
    url: `${JSD}/calsans-cossui/CalSansVF.woff2`,
    italicUrl: `${JSD}/calsans-cossui/CalSansVF-Italic.woff2`,
}

// Spread into addPropertyControls. With Font = coss ui, the two file pickers take the
// Framer-hosted files; left empty, coss ui loads from jsDelivr instead.
const FONT_FILES = ["woff2", "woff", "ttf", "otf"]
export const FONT_CONTROLS = {
    font: {
        type: ControlType.Enum,
        title: "Font",
        options: ["full", "coss"],
        optionTitles: ["Cal Sans 2", "coss ui"],
        defaultValue: "full",
    },
    cossRoman: {
        type: ControlType.File,
        title: "coss Roman",
        allowedFileTypes: FONT_FILES,
        hidden: (p: any) => p.font !== "coss",
    },
    cossItalic: {
        type: ControlType.File,
        title: "coss Italic",
        allowedFileTypes: FONT_FILES,
        hidden: (p: any) => p.font !== "coss",
    },
}

// The font a component's props ask for. Picked files get their own family name, so
// two instances pointing at different files never overwrite each other's @font-face.
export function calFont(props: {
    font?: string
    cossRoman?: string
    cossItalic?: string
}): CalFont {
    if (props?.font !== "coss") return CAL_SANS
    if (!props.cossRoman) return CAL_SANS_COSS
    let h = 0
    for (const c of props.cossRoman) h = (h * 31 + c.charCodeAt(0)) | 0
    return {
        family: `Cal Sans 2 coss ${(h >>> 0).toString(36)}`,
        url: props.cossRoman,
        italicUrl: props.cossItalic || props.cossRoman,
    }
}

// Declared as both normal and italic so `font-style: italic` never synthesises a
// slant: the full build italicises through its `ital` axis (same file), coss ui
// through its Italic file. Components send both `"ital" 1` and `font-style: italic`.
export function buildFontFaceCSS(v: CalFont = CAL_SANS, display: string = "swap") {
    const face = (url: string, style: string) => {
        const path = url.split("?")[0]
        const fmt = path.endsWith(".ttf")
            ? ' format("truetype")'
            : path.endsWith(".otf")
              ? ' format("opentype")'
              : path.endsWith(".woff2")
                ? ' format("woff2")'
                : path.endsWith(".woff")
                  ? ' format("woff")'
                  : ""
        return `@font-face {
  font-family: "${v.family}";
  src: url("${url}")${fmt};
  font-weight: 400 700;
  font-style: ${style};
  font-display: ${display};
}`
    }
    return face(v.url, "normal") + "\n" + face(v.italicUrl || v.url, "italic")
}

// Read head.fontRevision straight from an uncompressed sfnt (.ttf/.otf). No deps.
// Cached by URL at module scope: 9 components probe the same font, and heavy hosts
// (e.g. the specimen card) mount ~15×/page — without this the same binary is
// fetched + parsed once per instance. The promise is cached so concurrent callers
// share one fetch; transient failures aren't cached so they can retry.
const _revCache = new Map<string, Promise<string>>()
export function readFontRevision(url: string): Promise<string> {
    if (!url || url.startsWith("__")) return Promise.resolve("url not set")
    const hit = _revCache.get(url)
    if (hit) return hit
    const p = _readFontRevision(url).then((r) => {
        if (r === "probe failed") _revCache.delete(url)
        return r
    })
    _revCache.set(url, p)
    return p
}
async function _readFontRevision(url: string): Promise<string> {
    try {
        const buf = await (await fetch(url)).arrayBuffer()
        const dv = new DataView(buf)
        const magic = dv.getUint32(0)
        if (magic === 0x774f4632 || magic === 0x774f4646)
            return "woff(2) — wire a .ttf to read build"
        const numTables = dv.getUint16(4)
        for (let i = 0; i < numTables; i++) {
            const rec = 12 + i * 16
            const tag = String.fromCharCode(
                dv.getUint8(rec),
                dv.getUint8(rec + 1),
                dv.getUint8(rec + 2),
                dv.getUint8(rec + 3)
            )
            if (tag === "head") {
                const off = dv.getUint32(rec + 8)
                return (dv.getInt32(off + 4) / 65536).toFixed(3)
            }
        }
        return "no head table"
    } catch (e) {
        return "probe failed"
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// AXIS RANGES — the six Cal Sans v2 variable axes, min / default / max (VISION §1).
// `wght` floor is 400 (Light/300 dropped). YTAS has no consumer yet — kept for
// completeness so the table is the single source of truth.
// ─────────────────────────────────────────────────────────────────────────────
export const AXIS_RANGES = {
    opsz: { min: 8, default: 14, max: 45 },
    GEOM: { min: 0, default: 25, max: 100 },
    wght: { min: 400, default: 400, max: 700 },
    YTAS: { min: 1440, default: 1440, max: 1600 },
    SHRP: { min: 0, default: 0, max: 100 },
    ital: { min: 0, default: 0, max: 1 },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// GEOM PRESETS — the v2 remap (VISION §2): A11y=0 / UI=25 (font default) / Base=50 /
// Geo=100, replacing v1's UI=0 / Text=50 / Geo=100. `Base` is the default form, so its
// name is ELIDED in labels (renders as plain "Cal Sans", no suffix).
// ─────────────────────────────────────────────────────────────────────────────
export const GEOM_PRESETS = {
    A11y: 0,
    UI: 25,
    Base: 50,
    Geo: 100,
} as const

export type GeomPresetName = keyof typeof GEOM_PRESETS

export const GEOM_PRESET_LIST: {
    name: GeomPresetName
    geom: number
    elide: boolean
}[] = [
    { name: "A11y", geom: 0, elide: false },
    { name: "UI", geom: 25, elide: false },
    { name: "Base", geom: 50, elide: true },
    { name: "Geo", geom: 100, elide: false },
]
export const WEIGHTS = [
    { name: "Regular", value: 400 },
    { name: "Medium", value: 500 },
    { name: "SemiBold", value: 600 },
    { name: "Bold", value: 700 },
] as const

// Framer treats .tsx code files as components and resolves imports only against files
// that export a default component. This placeholder makes "Shared" register as a valid,
// importable code file — it renders nothing and is never placed on the canvas. The
// named exports above are the actual payload.
export default function Shared() {
    return null
}
