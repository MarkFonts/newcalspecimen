"use client"

// Client boundary for components/CustomTypeTester.tsx (section 20, ≥810).
//
// Its props differ per Framer band. `defaultSize` seeds useState, so
// a prop change after mount would not reach the text; the instance is keyed by band and
// remounts when the band changes (Framer swaps the instance the same way). The server
// renders the ≥1920 props; tablets remount with theirs right after hydration, well below
// the fold. Hard-coded UI colors are themed from src/sections/20-tester.module.css.
import { minWidth, useBand, type BandQuery } from "@/lib/useBand"
import CustomTypeTesterSource from "@components/CustomTypeTester"

type Band = "810" | "1200" | "1920"

// Only the bands this instance is shown in (it's hidden below 810). "810" is the fallback.
// The server renders "1920".
const BANDS: BandQuery<Band>[] = [
    ["1920", minWidth(1920)],
    ["1200", minWidth(1200)],
]

// Base (≥1920) props, then the 1200–1919 and 810–1199 overrides, from the page module.
const BASE = {
    font: "full",
    defaultContent: "Type away...",
    defaultSize: 100,
    defaultSpacing: 0,
    defaultWeight: 400,
    gapX: 75,
    offsetY: -3,
    previewHeight: 250,
    refreshColor: "rgb(102, 102, 102)",
    refreshSize: 16,
    rowPaddingTop: -24,
    debug: false,
}
const BY_BAND: Record<Band, typeof BASE> = {
    "1920": BASE,
    "1200": { ...BASE, gapX: 66 },
    "810": { ...BASE, defaultSize: 80, gapX: 161, rowPaddingTop: -34 },
}

export function CustomTypeTester() {
    const band = useBand(BANDS, "810", "1920")
    return <CustomTypeTesterSource key={band} {...BY_BAND[band]} />
}
