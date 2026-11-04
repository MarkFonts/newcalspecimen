"use client"

// Client boundary for components/VariableMorph2.tsx (section 07, "Display to text" a).
//
// Props per Framer band, from the page module. React 19
// ignores defaultProps on function components, so every prop is passed.
import { framerBands, useBand } from "@/lib/useBand"
import VariableMorph2Source from "@components/VariableMorph2"

type Band = "small" | "phone" | "tablet" | "desktop" | "large"

// Framer's band at this width. The server (and hydration) assume 1200–1919.
const BANDS = framerBands<Band>({ large: "large", desktop: "desktop", tablet: "tablet", phone: "phone" })

const BASE = {
    text: "Cal.com",
    fontFamily: "Cal Anim Graph 6 [MORF,opsz] Variable Regular",
    duration: 5,
    label0: "original branding face",
    label50: "legible spaces",
    label100: "lowered x-height",
    debug: false,
}

const BY_BAND: Record<Band, { fontSize: number; opszValue: number; labelOffset: number; label50?: string }> = {
    large: { fontSize: 200, opszValue: 300, labelOffset: 140 },
    desktop: { fontSize: 200, opszValue: 300, labelOffset: 130 },
    tablet: { fontSize: 170, opszValue: 250, labelOffset: 130, label50: "open apertures and spacing" },
    phone: { fontSize: 80, opszValue: 200, labelOffset: 90 },
    small: { fontSize: 80, opszValue: 200, labelOffset: 90 },
}

export function VariableMorph2() {
    const band = useBand(BANDS, "small", "desktop")
    return <VariableMorph2Source {...BASE} {...BY_BAND[band]} />
}
