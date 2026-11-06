// The Framer components import "https://framer.com/m/Shared-…", which
// config/framer-source-loader.cjs points here instead of at components/Shared.tsx. Everything
// passes through unchanged except buildFontFaceCSS: each component calls it on mount and
// appends the result as a <style>, so one page registered "Cal Sans 2" 37 times, fetched the
// file 7 times, and relaid out the whole page after every duplicate (2026-11-05 audit). The
// port declares every family the components ask for once, in <head> (LITERAL_FONT_FACES in
// src/fonts.ts), so here a family the document already has gets an empty string, and one it
// doesn't is registered once, in a tag no component owns or removes.
// The defaults and the display argument match Shared.tsx: CalFeatureSpecimen calls this with no
// arguments, and CalGraphics and HOIGrid pass display "block".
import { buildFontFaceCSS as build, CAL_SANS, type CalFont } from "@components/Shared"

export * from "@components/Shared"

const registered = new Set<string>()

export function buildFontFaceCSS(ver: CalFont = CAL_SANS, display: string = "swap"): string {
    if (typeof document === "undefined") return ""
    const family = ver.family
    if (registered.has(family)) return ""
    const inHead = [...document.fonts].some((f) => f.family.replace(/^"|"$/g, "") === family)
    registered.add(family)
    if (inHead) return ""
    const el = document.createElement("style")
    el.dataset.calFont = family
    el.textContent = build(ver, display)
    document.head.appendChild(el)
    return ""
}
