"use client"

// Client boundary for components/CalGraphics.tsx (default export CalGraphicsPerfected),
// the pinned "Cal Graphics" word-mark in scroll-container.
//
// SSR-safe: it touches document.fonts only inside effects, and renders at opacity 0
// until the fonts are ready, so the server pass is invisible either way.
//
// CalGraphicsByBand picks Framer's per-breakpoint props (fontSize 65 / 110 / 140,
// badgeOnTop below 810) with the same band edges as Framer.
import { framerBands, useBand } from "@/lib/useBand"
import CalGraphicsPerfected from "@components/CalGraphics"

export { CalGraphicsPerfected as CalGraphics }

// ── Framer's breakpoint bands ────────────────────────────────────────────────────────
type Band = "389" | "390" | "810" | "1200" | "1920"
const BANDS = framerBands<Band>({ large: "1920", desktop: "1200", tablet: "810", phone: "390" })

type Props = Record<string, unknown>

/** `base` is the ≥1920 prop set; `bands` holds each band's overrides (Framer's `overrides`). */
export function CalGraphicsByBand({ base, bands }: { base: Props; bands: Partial<Record<Band, Props>> }) {
    const band = useBand(BANDS, "389", "1920")
    return <CalGraphicsPerfected {...base} {...bands[band]} />
}
